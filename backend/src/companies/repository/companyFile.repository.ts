import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

export class CompanyFileRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.companyFile);
  }

  async findByCompanyId(companyId: string) {
    return prisma.companyFile.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStorageSummary(companyId: string) {
    const aggregate = await prisma.companyFile.aggregate({
      where: { companyId, deletedAt: null },
      _sum: { size: true },
      _count: { id: true },
    });
    return { totalSize: aggregate._sum.size || 0, fileCount: aggregate._count.id || 0 };
  }
}

export const companyFileRepository = new CompanyFileRepository();
