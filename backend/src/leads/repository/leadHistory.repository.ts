import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

export class LeadHistoryRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.leadHistory);
  }

  async findByLeadId(leadId: string, filters: {
    search?: string;
  }) {
    const where: any = {
      leadId,
      deletedAt: null,
    };

    if (filters.search) {
      where.OR = [
        { action: { contains: filters.search, mode: 'insensitive' } },
        { fieldName: { contains: filters.search, mode: 'insensitive' } },
        { oldValue: { contains: filters.search, mode: 'insensitive' } },
        { newValue: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.leadHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async logChange(data: {
    leadId: string;
    action: string;
    fieldName?: string;
    oldValue?: string;
    newValue?: string;
    userId?: string;
    createdBy?: string;
  }) {
    return prisma.leadHistory.create({
      data: {
        leadId: data.leadId,
        action: data.action,
        fieldName: data.fieldName || null,
        oldValue: data.oldValue || null,
        newValue: data.newValue || null,
        userId: data.userId || null,
        createdBy: data.createdBy || null,
      },
    });
  }
}

export const leadHistoryRepository = new LeadHistoryRepository();
export default leadHistoryRepository;
