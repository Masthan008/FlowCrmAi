import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

export class LeadNoteRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.leadNote);
  }

  async findByLeadId(leadId: string) {
    return prisma.leadNote.findMany({
      where: { leadId, deletedAt: null },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }
}

export const leadNoteRepository = new LeadNoteRepository();
export default leadNoteRepository;
