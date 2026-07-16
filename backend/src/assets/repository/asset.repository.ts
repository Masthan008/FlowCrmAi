import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export class AssetRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.AssetWhereInput;
    orderBy?: Prisma.AssetOrderByWithRelationInput;
  }) {
    return prisma.asset.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        customer: {
          select: { id: true, name: true, email: true },
        },
        company: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async count(where?: Prisma.AssetWhereInput) {
    return prisma.asset.count({ where });
  }

  async findById(id: string) {
    return prisma.asset.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        customer: {
          select: { id: true, name: true, email: true },
        },
        company: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async create(data: Prisma.AssetUncheckedCreateInput) {
    return prisma.asset.create({
      data,
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async update(id: string, data: Prisma.AssetUncheckedUpdateInput) {
    return prisma.asset.update({
      where: { id },
      data,
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async softDelete(id: string, userId?: string) {
    return prisma.asset.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId || null,
      },
    });
  }
}

export const assetRepository = new AssetRepository();
export default assetRepository;
