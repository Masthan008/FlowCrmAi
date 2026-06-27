import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

export class ContactHistoryRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.contactHistory);
  }

  async findByContactId(contactId: string, search?: string) {
    const where: any = { contactId, deletedAt: null };
    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { fieldName: { contains: search, mode: 'insensitive' } },
        { oldValue: { contains: search, mode: 'insensitive' } },
        { newValue: { contains: search, mode: 'insensitive' } },
      ];
    }
    return prisma.contactHistory.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async logChange(params: {
    contactId: string;
    action: string;
    fieldName?: string;
    oldValue?: string;
    newValue?: string;
    userId?: string;
    createdBy?: string;
  }) {
    return prisma.contactHistory.create({
      data: {
        contactId: params.contactId,
        action: params.action,
        fieldName: params.fieldName || null,
        oldValue: params.oldValue || null,
        newValue: params.newValue || null,
        userId: params.userId || null,
        createdBy: params.createdBy || 'system',
      },
    });
  }
}

export const contactHistoryRepository = new ContactHistoryRepository();
export default contactHistoryRepository;
