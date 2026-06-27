import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

export class ContactFileRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.contactFile);
  }

  async findByContactId(contactId: string, search?: string) {
    const where: any = { contactId, deletedAt: null };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    return prisma.contactFile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const contactFileRepository = new ContactFileRepository();
export default contactFileRepository;
