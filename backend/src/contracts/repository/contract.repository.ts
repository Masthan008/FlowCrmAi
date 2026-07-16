import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export class ContractRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ContractWhereInput;
    orderBy?: Prisma.ContractOrderByWithRelationInput;
  }) {
    return prisma.contract.findMany({
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

  async count(where?: Prisma.ContractWhereInput) {
    return prisma.contract.count({ where });
  }

  async findById(id: string) {
    return prisma.contract.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async create(data: Prisma.ContractUncheckedCreateInput) {
    return prisma.contract.create({
      data,
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async update(id: string, data: Prisma.ContractUncheckedUpdateInput) {
    return prisma.contract.update({
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
    return prisma.contract.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId || null,
      },
    });
  }
}

export const contractRepository = new ContractRepository();
export default contractRepository;
