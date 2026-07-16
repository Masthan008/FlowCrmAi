import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export class PortalUserRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PortalUserWhereInput;
    orderBy?: Prisma.PortalUserOrderByWithRelationInput;
  }) {
    return prisma.portalUser.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async count(where?: Prisma.PortalUserWhereInput) {
    return prisma.portalUser.count({ where });
  }

  async findById(id: string) {
    return prisma.portalUser.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findByEmail(email: string) {
    return prisma.portalUser.findUnique({
      where: { email },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async create(data: Prisma.PortalUserUncheckedCreateInput) {
    return prisma.portalUser.create({
      data,
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async update(id: string, data: Prisma.PortalUserUncheckedUpdateInput) {
    return prisma.portalUser.update({
      where: { id },
      data,
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async softDelete(id: string, userId?: string) {
    return prisma.portalUser.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId || null,
      },
    });
  }
}

export const portalUserRepository = new PortalUserRepository();
export default portalUserRepository;
