import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

export class LeadFileRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.leadFile);
  }

  async findByLeadId(leadId: string) {
    return prisma.leadFile.findMany({
      where: { leadId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStorageSummary(leadId: string) {
    const aggregate = await prisma.leadFile.aggregate({
      where: { leadId, deletedAt: null },
      _sum: { size: true },
      _count: { id: true },
    });
    return {
      totalSize: aggregate._sum.size || 0,
      fileCount: aggregate._count.id || 0,
    };
  }
}

export const leadFileRepository = new LeadFileRepository();
export default leadFileRepository;
