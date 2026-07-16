import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export class ChatConversationRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ChatConversationWhereInput;
    orderBy?: Prisma.ChatConversationOrderByWithRelationInput;
  }) {
    return prisma.chatConversation.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true },
        },
        customer: {
          select: { id: true, name: true, email: true },
        },
        company: {
          select: { id: true, name: true },
        },
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  async count(where?: Prisma.ChatConversationWhereInput) {
    return prisma.chatConversation.count({ where });
  }

  async findById(id: string) {
    return prisma.chatConversation.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true },
        },
        customer: {
          select: { id: true, name: true, email: true },
        },
        company: {
          select: { id: true, name: true },
        },
        messages: {
          orderBy: { sentAt: 'asc' },
        },
      },
    });
  }

  async create(data: Prisma.ChatConversationUncheckedCreateInput) {
    return prisma.chatConversation.create({
      data,
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async update(id: string, data: Prisma.ChatConversationUncheckedUpdateInput) {
    return prisma.chatConversation.update({
      where: { id },
      data,
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true },
        },
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async softDelete(id: string, userId?: string) {
    return prisma.chatConversation.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId || null,
      },
    });
  }
}

export const chatConversationRepository = new ChatConversationRepository();
export default chatConversationRepository;
