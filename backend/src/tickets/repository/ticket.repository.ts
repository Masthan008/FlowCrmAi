import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export class TicketRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.TicketWhereInput;
    orderBy?: Prisma.TicketOrderByWithRelationInput;
  }) {
    return prisma.ticket.findMany({
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
      },
    });
  }

  async count(where?: Prisma.TicketWhereInput) {
    return prisma.ticket.count({ where });
  }

  async findById(id: string) {
    return prisma.ticket.findUnique({
      where: { id },
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

  async create(data: Prisma.TicketUncheckedCreateInput) {
    return prisma.ticket.create({
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

  async update(id: string, data: Prisma.TicketUncheckedUpdateInput) {
    return prisma.ticket.update({
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
    return prisma.ticket.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId || null,
      },
    });
  }
}

export const ticketRepository = new TicketRepository();
export default ticketRepository;
