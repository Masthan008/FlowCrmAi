import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

export class ContactNoteRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.contactNote);
  }

  async findByContactId(contactId: string, search?: string) {
    const where: any = { contactId, deletedAt: null };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }
    return prisma.contactNote.findMany({
      where,
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }
}

export const contactNoteRepository = new ContactNoteRepository();
export default contactNoteRepository;
