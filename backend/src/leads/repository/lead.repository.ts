import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

// Relations to include when fetching leads
const leadInclude = {
  source: { select: { id: true, name: true } },
  status: { select: { id: true, name: true, color: true, order: true } },
  assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
};

export class LeadRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.lead);
  }

  /**
   * Generate the next sequential lead number (LEAD-00001, LEAD-00002, ...)
   */
  async getNextLeadNumber(): Promise<string> {
    const lastLead = await prisma.lead.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { leadNumber: true },
    });

    let nextNum = 1;
    if (lastLead?.leadNumber) {
      const parts = lastLead.leadNumber.split('-');
      const num = parseInt(parts[1], 10);
      if (!isNaN(num)) nextNum = num + 1;
    }

    return `LEAD-${String(nextNum).padStart(5, '0')}`;
  }

  /**
   * Find a single lead with all relations
   */
  async findWithRelations(id: string) {
    return prisma.lead.findFirst({
      where: { id, deletedAt: null },
      include: leadInclude,
    });
  }

  /**
   * Server-side paginated listing with filters, sorting, and search
   */
  async paginateWithRelations(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    source?: string;
    priority?: string;
    owner?: string;
    sortBy?: string;
    sortDir?: string;
  }) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      source,
      priority,
      owner,
      sortBy = 'createdAt',
      sortDir = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const where: any = { deletedAt: null };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { leadNumber: { contains: search, mode: 'insensitive' } },
        { website: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.statusId = status;
    if (source) where.sourceId = source;
    if (priority) where.priority = priority;
    if (owner) where.assignedToId = owner;

    // Build orderBy
    const orderBy: any = {};
    const allowedSortFields = [
      'leadNumber', 'fullName', 'companyName', 'email', 'phone',
      'priority', 'value', 'createdAt', 'updatedAt', 'expectedClosingDate',
    ];
    if (allowedSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortDir === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [items, totalItems] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: leadInclude,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.lead.count({ where }),
    ]);

    return {
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      page,
      limit,
    };
  }

  /**
   * Get aggregate statistics for leads
   */
  async getStatistics() {
    const baseWhere = { deletedAt: null };

    // Fetch all statuses to map names
    const statuses = await prisma.leadStatus.findMany({ select: { id: true, name: true } });
    const statusMap = new Map(statuses.map((s) => [s.name, s.id]));

    const [
      totalLeads,
      qualifiedLeads,
      wonLeads,
      lostLeads,
      totalValue,
    ] = await Promise.all([
      prisma.lead.count({ where: baseWhere }),
      prisma.lead.count({
        where: { ...baseWhere, statusId: statusMap.get('Qualified') || undefined },
      }),
      prisma.lead.count({
        where: { ...baseWhere, statusId: statusMap.get('Won') || undefined },
      }),
      prisma.lead.count({
        where: { ...baseWhere, statusId: statusMap.get('Lost') || undefined },
      }),
      prisma.lead.aggregate({
        where: baseWhere,
        _avg: { value: true },
        _sum: { value: true },
      }),
    ]);

    const conversionRate = totalLeads > 0
      ? parseFloat(((wonLeads / totalLeads) * 100).toFixed(2))
      : 0;

    return {
      totalLeads,
      qualifiedLeads,
      wonLeads,
      lostLeads,
      conversionRate,
      averageValue: totalValue._avg.value || 0,
      totalValue: totalValue._sum.value || 0,
    };
  }

  /**
   * Update lead status
   */
  async updateStatus(id: string, statusId: string, updatedBy: string) {
    return prisma.lead.update({
      where: { id },
      data: { statusId, updatedBy },
      include: leadInclude,
    });
  }

  /**
   * Update lead owner
   */
  async updateOwner(id: string, assignedToId: string, updatedBy: string) {
    return prisma.lead.update({
      where: { id },
      data: { assignedToId, updatedBy },
      include: leadInclude,
    });
  }

  /**
   * Update lead priority
   */
  async updatePriority(id: string, priority: string, updatedBy: string) {
    return prisma.lead.update({
      where: { id },
      data: { priority, updatedBy },
      include: leadInclude,
    });
  }

  /**
   * Update lead rating
   */
  async updateRating(id: string, rating: number, updatedBy: string) {
    return prisma.lead.update({
      where: { id },
      data: { rating, updatedBy },
      include: leadInclude,
    });
  }

  /**
   * Create a new lead with auto-generated lead number
   */
  async createLead(data: any) {
    const leadNumber = await this.getNextLeadNumber();
    return prisma.lead.create({
      data: {
        ...data,
        leadNumber,
        fullName: `${data.firstName} ${data.lastName}`,
      },
      include: leadInclude,
    });
  }

  /**
   * Update an existing lead
   */
  async updateLead(id: string, data: any) {
    const updateData = { ...data };
    if (data.firstName || data.lastName) {
      // Fetch current lead to compute full name if partial update
      const current = await prisma.lead.findUnique({ where: { id }, select: { firstName: true, lastName: true } });
      if (current) {
        updateData.fullName = `${data.firstName || current.firstName} ${data.lastName || current.lastName}`;
      }
    }
    return prisma.lead.update({
      where: { id },
      data: updateData,
      include: leadInclude,
    });
  }

  /**
   * Get all lead sources
   */
  async getSources() {
    return prisma.leadSource.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get all lead statuses
   */
  async getStatuses() {
    return prisma.leadStatus.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { order: 'asc' },
    });
  }
}

export const leadRepository = new LeadRepository();
export default leadRepository;
