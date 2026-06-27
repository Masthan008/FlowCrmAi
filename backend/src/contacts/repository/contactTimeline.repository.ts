import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

export class ContactTimelineRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.contactTimeline);
  }

  async findByContactId(contactId: string, search?: string) {
    const where: any = { contactId, deletedAt: null };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    return prisma.contactTimeline.findMany({
      where,
      orderBy: { eventDate: 'desc' },
    });
  }
}

export const contactTimelineRepository = new ContactTimelineRepository();
export default contactTimelineRepository;
