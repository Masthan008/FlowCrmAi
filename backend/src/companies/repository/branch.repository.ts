import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

export class BranchRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.branch);
  }

  async findByCompanyId(companyId: string) {
    return prisma.branch.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdWithCompany(id: string) {
    return prisma.branch.findFirst({
      where: { id, deletedAt: null },
      include: { company: true },
    });
  }
}

export const branchRepository = new BranchRepository();
