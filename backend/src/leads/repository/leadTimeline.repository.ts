import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

export class LeadTimelineRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.leadTimeline);
  }

  async findByLeadId(leadId: string, filters: {
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {
      leadId,
      deletedAt: null,
    };

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.startDate || filters.endDate) {
      where.eventDate = {};
      if (filters.startDate) {
        where.eventDate.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.eventDate.lte = new Date(filters.endDate);
      }
    }

    return prisma.leadTimeline.findMany({
      where,
      orderBy: { eventDate: 'desc' },
    });
  }

  async logEvent(data: {
    leadId: string;
    type: string;
    title: string;
    description?: string;
    icon?: string;
    color?: string;
    createdBy?: string;
  }) {
    return prisma.leadTimeline.create({
      data: {
        leadId: data.leadId,
        type: data.type,
        title: data.title,
        description: data.description || null,
        icon: data.icon || null,
        color: data.color || null,
        createdBy: data.createdBy || null,
      },
    });
  }
}

export const leadTimelineRepository = new LeadTimelineRepository();
export default leadTimelineRepository;
