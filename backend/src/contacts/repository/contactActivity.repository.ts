import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

export class ContactActivityRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.contactActivity);
  }

  async findByContactId(contactId: string, params: any) {
    const { type, owner, status, priority, search } = params;
    const where: any = { contactId, deletedAt: null };

    if (type) where.type = type;
    if (owner) where.assignedToId = owner;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.contactActivity.findMany({
      where,
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { activityDate: 'desc' },
    });
  }
}

export const contactActivityRepository = new ContactActivityRepository();
export default contactActivityRepository;
