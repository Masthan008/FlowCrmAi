import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export class WebFormRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.WebFormWhereInput;
    orderBy?: Prisma.WebFormOrderByWithRelationInput;
  }) {
    return prisma.webForm.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
      include: {
        assignTo: {
          select: { id: true, firstName: true, lastName: true },
        },
        source: {
          select: { id: true, name: true },
        },
        status: {
          select: { id: true, name: true },
        },
        _count: {
          select: { submissions: true },
        },
      },
    });
  }

  async count(where?: Prisma.WebFormWhereInput) {
    return prisma.webForm.count({ where });
  }

  async findById(id: string) {
    return prisma.webForm.findUnique({
      where: { id },
      include: {
        assignTo: {
          select: { id: true, firstName: true, lastName: true },
        },
        source: {
          select: { id: true, name: true },
        },
        status: {
          select: { id: true, name: true },
        },
        _count: {
          select: { submissions: true },
        },
      },
    });
  }

  async create(data: Prisma.WebFormUncheckedCreateInput) {
    return prisma.webForm.create({
      data,
      include: {
        assignTo: {
          select: { id: true, firstName: true, lastName: true },
        },
        source: {
          select: { id: true, name: true },
        },
        status: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async update(id: string, data: Prisma.WebFormUncheckedUpdateInput) {
    return prisma.webForm.update({
      where: { id },
      data,
      include: {
        assignTo: {
          select: { id: true, firstName: true, lastName: true },
        },
        source: {
          select: { id: true, name: true },
        },
        status: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async softDelete(id: string, userId?: string) {
    return prisma.webForm.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId || null,
      },
    });
  }
}

export const webFormRepository = new WebFormRepository();
export default webFormRepository;
