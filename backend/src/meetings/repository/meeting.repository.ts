import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export class MeetingRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.MeetingWhereInput;
    orderBy?: Prisma.MeetingOrderByWithRelationInput;
  }) {
    return prisma.meeting.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
      include: {
        organizer: {
          select: { id: true, firstName: true, lastName: true },
        },
        customer: {
          select: { id: true, name: true, email: true },
        },
        deal: {
          select: { id: true, name: true, value: true },
        },
      },
    });
  }

  async count(where?: Prisma.MeetingWhereInput) {
    return prisma.meeting.count({ where });
  }

  async findById(id: string) {
    return prisma.meeting.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { id: true, firstName: true, lastName: true },
        },
        customer: {
          select: { id: true, name: true, email: true },
        },
        deal: {
          select: { id: true, name: true, value: true },
        },
      },
    });
  }

  async create(data: Prisma.MeetingUncheckedCreateInput) {
    return prisma.meeting.create({
      data,
      include: {
        organizer: {
          select: { id: true, firstName: true, lastName: true },
        },
        customer: {
          select: { id: true, name: true, email: true },
        },
        deal: {
          select: { id: true, name: true, value: true },
        },
      },
    });
  }

  async update(id: string, data: Prisma.MeetingUncheckedUpdateInput) {
    return prisma.meeting.update({
      where: { id },
      data,
      include: {
        organizer: {
          select: { id: true, firstName: true, lastName: true },
        },
        customer: {
          select: { id: true, name: true, email: true },
        },
        deal: {
          select: { id: true, name: true, value: true },
        },
      },
    });
  }

  async softDelete(id: string, userId?: string) {
    return prisma.meeting.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId || null,
      },
    });
  }
}

export const meetingRepository = new MeetingRepository();
export default meetingRepository;
