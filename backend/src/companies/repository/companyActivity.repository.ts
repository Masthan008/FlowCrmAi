import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

export class CompanyActivityRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.companyActivity);
  }

  async findByFilters(companyId: string, filters: {
    search?: string; type?: string; priority?: string; status?: string;
    createdBy?: string; startDate?: string; endDate?: string;
  }) {
    const where: any = { companyId, deletedAt: null };
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.type) where.type = filters.type;
    if (filters.priority) where.priority = filters.priority;
    if (filters.status) where.status = filters.status;
    if (filters.createdBy) where.createdBy = filters.createdBy;
    if (filters.startDate || filters.endDate) {
      where.activityDate = {};
      if (filters.startDate) where.activityDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.activityDate.lte = new Date(filters.endDate);
    }
    return prisma.companyActivity.findMany({
      where,
      include: { assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { activityDate: 'desc' },
    });
  }
}

export const companyActivityRepository = new CompanyActivityRepository();
