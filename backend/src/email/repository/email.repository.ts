import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export class EmailRepository {
  async findAccounts(where?: Prisma.EmailAccountWhereInput) {
    return prisma.emailAccount.findMany({
      where: { ...where, deletedAt: null },
      orderBy: { email: 'asc' },
    });
  }

  async findAccountById(id: string) {
    return prisma.emailAccount.findUnique({
      where: { id },
    });
  }

  async findMessages(params: {
    skip?: number;
    take?: number;
    where?: Prisma.EmailMessageWhereInput;
    orderBy?: Prisma.EmailMessageOrderByWithRelationInput;
  }) {
    return prisma.emailMessage.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
    });
  }

  async countMessages(where?: Prisma.EmailMessageWhereInput) {
    return prisma.emailMessage.count({ where });
  }

  async findMessageById(id: string) {
    return prisma.emailMessage.findUnique({
      where: { id },
    });
  }

  async createMessage(data: Prisma.EmailMessageUncheckedCreateInput) {
    return prisma.emailMessage.create({
      data,
    });
  }

  async updateMessage(id: string, data: Prisma.EmailMessageUncheckedUpdateInput) {
    return prisma.emailMessage.update({
      where: { id },
      data,
    });
  }

  async softDeleteMessage(id: string, userId?: string) {
    return prisma.emailMessage.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId || null,
      },
    });
  }
}

export const emailRepository = new EmailRepository();
export default emailRepository;
