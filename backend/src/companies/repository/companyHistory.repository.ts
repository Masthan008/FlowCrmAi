import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

export class CompanyHistoryRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.companyHistory);
  }

  async findByCompanyId(companyId: string, filters: { search?: string }) {
    const where: any = { companyId, deletedAt: null };
    if (filters.search) {
      where.OR = [
        { action: { contains: filters.search, mode: 'insensitive' } },
        { fieldName: { contains: filters.search, mode: 'insensitive' } },
        { oldValue: { contains: filters.search, mode: 'insensitive' } },
        { newValue: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    return prisma.companyHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async logChange(data: {
    companyId: string; action: string; fieldName?: string;
    oldValue?: string; newValue?: string; userId?: string; createdBy?: string;
  }) {
    return prisma.companyHistory.create({
      data: {
        companyId: data.companyId, action: data.action,
        fieldName: data.fieldName || null, oldValue: data.oldValue || null,
        newValue: data.newValue || null, userId: data.userId || null,
        createdBy: data.createdBy || null,
      },
    });
  }
}

export const companyHistoryRepository = new CompanyHistoryRepository();
