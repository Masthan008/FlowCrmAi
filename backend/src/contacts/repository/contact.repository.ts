import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

const contactInclude = {
  company: { select: { id: true, name: true, domain: true, phone: true, industry: true, status: true } },
  lead: { select: { id: true, leadNumber: true, firstName: true, lastName: true, fullName: true } },
  owner: { select: { id: true, firstName: true, lastName: true, email: true } },
  customer: { select: { id: true, name: true, email: true, phone: true, type: true, status: true } },
};

export class ContactRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.contact);
  }

  /**
   * Generate the next sequential contact number (CNT-00001, CNT-00002, ...)
   */
  async getNextContactNumber(): Promise<string> {
    const lastContact = await prisma.contact.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { contactNumber: true },
    });

    let nextNum = 1;
    if (lastContact?.contactNumber) {
      const parts = lastContact.contactNumber.split('-');
      const num = parseInt(parts[1], 10);
      if (!isNaN(num)) nextNum = num + 1;
    }

    return `CNT-${String(nextNum).padStart(5, '0')}`;
  }

  /**
   * Find contact by ID with all relations
   */
  async findByIdWithRelations(id: string) {
    return prisma.contact.findFirst({
      where: { id, deletedAt: null },
      include: contactInclude,
    });
  }

  /**
   * Server-side paginated list of contacts with filters, sorting, and search
   */
  async paginateWithRelations(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    owner?: string;
    vip?: boolean;
    recentlyAdded?: boolean;
    customerOnly?: boolean;
    partnerOnly?: boolean;
    inactiveOnly?: boolean;
    archivedOnly?: boolean;
    myContactsOnly?: boolean;
    currentUserId?: string;
    companyId?: string;
    sortBy?: string;
    sortDir?: string;
  }) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      owner,
      vip,
      recentlyAdded,
      customerOnly,
      partnerOnly,
      inactiveOnly,
      archivedOnly,
      myContactsOnly,
      currentUserId,
      companyId,
      sortBy = 'createdAt',
      sortDir = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    // Build dynamic where clause
    const where: any = { deletedAt: null };

    // Standard Quick Filters
    if (vip) {
      where.status = 'VIP';
    }
    if (customerOnly) {
      where.status = 'Customer';
    }
    if (partnerOnly) {
      where.status = 'Partner';
    }
    if (inactiveOnly) {
      where.status = 'Inactive';
    }
    if (archivedOnly) {
      where.status = 'Archived';
    }
    if (myContactsOnly && currentUserId) {
      // Find employee associated with user
      const emp = await prisma.employee.findFirst({
        where: { userId: currentUserId, deletedAt: null },
      });
      if (emp) {
        where.ownerId = emp.id;
      } else {
        // Fallback to impossible owner so it returns empty list rather than exposing other users' contacts
        where.ownerId = '00000000-0000-0000-0000-000000000000';
      }
    }

    if (recentlyAdded) {
      // Added within last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      where.createdAt = { gte: sevenDaysAgo };
    }

    // Explicit Filter fields
    if (status && !vip && !customerOnly && !partnerOnly && !inactiveOnly && !archivedOnly) {
      where.status = status;
    }
    if (owner) {
      where.ownerId = owner;
    }
    if (companyId) {
      where.companyId = companyId;
    }

    // Search query
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { contactNumber: { contains: search, mode: 'insensitive' } },
        { jobTitle: { contains: search, mode: 'insensitive' } },
        { linkedin: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Build orderBy
    const orderBy: any = {};
    const allowedSortFields = [
      'contactNumber', 'firstName', 'lastName', 'fullName', 'email', 'phone',
      'jobTitle', 'status', 'createdAt', 'updatedAt',
    ];

    if (allowedSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortDir === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [items, totalItems] = await Promise.all([
      prisma.contact.findMany({
        where,
        include: contactInclude,
        skip,
        take: limit,
        orderBy,
      }),
      prisma.contact.count({ where }),
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
   * Bulk status update
   */
  async bulkUpdateStatus(ids: string[], status: string, updatedBy: string) {
    return prisma.contact.updateMany({
      where: {
        id: { in: ids },
        deletedAt: null,
      },
      data: {
        status,
        updatedBy,
      },
    });
  }

  /**
   * Bulk owner update
   */
  async bulkUpdateOwner(ids: string[], ownerId: string, updatedBy: string) {
    return prisma.contact.updateMany({
      where: {
        id: { in: ids },
        deletedAt: null,
      },
      data: {
        ownerId,
        updatedBy,
      },
    });
  }

  /**
   * Get Contact Statistics
   */
  async getStatistics(currentUserId?: string) {
    const baseWhere = { deletedAt: null };

    // Recently added within 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalContacts, activeContacts, vipContacts, customerContacts, partnerContacts, recentlyAdded] = await Promise.all([
      prisma.contact.count({ where: baseWhere }),
      prisma.contact.count({ where: { ...baseWhere, status: 'Active' } }),
      prisma.contact.count({ where: { ...baseWhere, status: 'VIP' } }),
      prisma.contact.count({ where: { ...baseWhere, status: 'Customer' } }),
      prisma.contact.count({ where: { ...baseWhere, status: 'Partner' } }),
      prisma.contact.count({ where: { ...baseWhere, createdAt: { gte: sevenDaysAgo } } }),
    ]);

    return {
      totalContacts,
      activeContacts,
      vipContacts,
      customerContacts,
      partnerContacts,
      recentlyAdded,
    };
  }
}

export const contactRepository = new ContactRepository();
export default contactRepository;
