import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

export class CompanyNoteRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.companyNote);
  }

  async findByCompanyId(companyId: string) {
    return prisma.companyNote.findMany({
      where: { companyId, deletedAt: null },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });
  }
}

export const companyNoteRepository = new CompanyNoteRepository();
