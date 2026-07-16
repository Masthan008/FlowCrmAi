import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export class ConsentLogRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ConsentLogWhereInput;
    orderBy?: Prisma.ConsentLogOrderByWithRelationInput;
  }) {
    return prisma.consentLog.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
      include: {
        contact: {
          select: { id: true, fullName: true, email: true },
        },
        company: {
          select: { id: true, name: true, primaryEmail: true },
        },
      },
    });
  }

  async count(where?: Prisma.ConsentLogWhereInput) {
    return prisma.consentLog.count({ where });
  }

  async findById(id: string) {
    return prisma.consentLog.findUnique({
      where: { id },
      include: {
        contact: {
          select: { id: true, fullName: true, email: true },
        },
        company: {
          select: { id: true, name: true, primaryEmail: true },
        },
      },
    });
  }

  async create(data: Prisma.ConsentLogUncheckedCreateInput) {
    return prisma.consentLog.create({ data });
  }

  async update(id: string, data: Prisma.ConsentLogUncheckedUpdateInput) {
    return prisma.consentLog.update({
      where: { id },
      data,
      include: {
        contact: {
          select: { id: true, fullName: true, email: true },
        },
        company: {
          select: { id: true, name: true, primaryEmail: true },
        },
      },
    });
  }
}

export class DataRequestRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DataRequestWhereInput;
    orderBy?: Prisma.DataRequestOrderByWithRelationInput;
  }) {
    return prisma.dataRequest.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
      include: {
        contact: {
          select: { id: true, fullName: true, email: true },
        },
        company: {
          select: { id: true, name: true, primaryEmail: true },
        },
      },
    });
  }

  async count(where?: Prisma.DataRequestWhereInput) {
    return prisma.dataRequest.count({ where });
  }

  async findById(id: string) {
    return prisma.dataRequest.findUnique({
      where: { id },
      include: {
        contact: {
          select: { id: true, fullName: true, email: true },
        },
        company: {
          select: { id: true, name: true, primaryEmail: true },
        },
      },
    });
  }

  async create(data: Prisma.DataRequestUncheckedCreateInput) {
    return prisma.dataRequest.create({
      data,
      include: {
        contact: {
          select: { id: true, fullName: true, email: true },
        },
        company: {
          select: { id: true, name: true, primaryEmail: true },
        },
      },
    });
  }

  async update(id: string, data: Prisma.DataRequestUncheckedUpdateInput) {
    return prisma.dataRequest.update({
      where: { id },
      data,
      include: {
        contact: {
          select: { id: true, fullName: true, email: true },
        },
        company: {
          select: { id: true, name: true, primaryEmail: true },
        },
      },
    });
  }
}

export const consentLogRepository = new ConsentLogRepository();
export const dataRequestRepository = new DataRequestRepository();
