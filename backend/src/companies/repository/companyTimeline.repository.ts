import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

export class CompanyTimelineRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.companyTimeline);
  }

  async findByCompanyId(companyId: string, filters: { search?: string; startDate?: string; endDate?: string }) {
    const where: any = { companyId, deletedAt: null };
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    if (filters.startDate || filters.endDate) {
      where.eventDate = {};
      if (filters.startDate) where.eventDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.eventDate.lte = new Date(filters.endDate);
    }
    return prisma.companyTimeline.findMany({
      where,
      orderBy: { eventDate: 'desc' },
    });
  }

  async logEvent(data: {
    companyId: string; type: string; title: string; description?: string;
    icon?: string; color?: string; createdBy?: string;
  }) {
    return prisma.companyTimeline.create({
      data: {
        companyId: data.companyId, type: data.type, title: data.title,
        description: data.description || null, icon: data.icon || null,
        color: data.color || null, createdBy: data.createdBy || null,
      },
    });
  }
}

export const companyTimelineRepository = new CompanyTimelineRepository();
