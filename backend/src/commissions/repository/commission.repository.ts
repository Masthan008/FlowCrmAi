import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export class CommissionRuleRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CommissionRuleWhereInput;
    orderBy?: Prisma.CommissionRuleOrderByWithRelationInput;
  }) {
    return prisma.commissionRule.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
      include: {
        _count: { select: { payouts: true } },
      },
    });
  }

  async count(where?: Prisma.CommissionRuleWhereInput) {
    return prisma.commissionRule.count({ where });
  }

  async findById(id: string) {
    return prisma.commissionRule.findUnique({
      where: { id },
      include: {
        _count: { select: { payouts: true } },
      },
    });
  }

  async create(data: Prisma.CommissionRuleUncheckedCreateInput) {
    return prisma.commissionRule.create({ data });
  }

  async update(id: string, data: Prisma.CommissionRuleUncheckedUpdateInput) {
    return prisma.commissionRule.update({ where: { id }, data });
  }

  async softDelete(id: string, userId?: string) {
    return prisma.commissionRule.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: userId || null },
    });
  }
}

export class CommissionPayoutRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.CommissionPayoutWhereInput;
    orderBy?: Prisma.CommissionPayoutOrderByWithRelationInput;
  }) {
    return prisma.commissionPayout.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
      include: {
        rule: { select: { id: true, name: true, type: true, rate: true } },
        employee: { select: { id: true, firstName: true, lastName: true, email: true } },
        deal: { select: { id: true, name: true, value: true } },
        invoice: { select: { id: true, number: true, total: true } },
      },
    });
  }

  async count(where?: Prisma.CommissionPayoutWhereInput) {
    return prisma.commissionPayout.count({ where });
  }

  async findById(id: string) {
    return prisma.commissionPayout.findUnique({
      where: { id },
      include: {
        rule: { select: { id: true, name: true, type: true, rate: true } },
        employee: { select: { id: true, firstName: true, lastName: true, email: true } },
        deal: { select: { id: true, name: true, value: true } },
        invoice: { select: { id: true, number: true, total: true } },
      },
    });
  }

  async create(data: Prisma.CommissionPayoutUncheckedCreateInput) {
    return prisma.commissionPayout.create({
      data,
      include: {
        rule: { select: { id: true, name: true, type: true, rate: true } },
        employee: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }

  async update(id: string, data: Prisma.CommissionPayoutUncheckedUpdateInput) {
    return prisma.commissionPayout.update({
      where: { id },
      data,
      include: {
        rule: { select: { id: true, name: true, type: true, rate: true } },
        employee: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });
  }
}

export const commissionRuleRepository = new CommissionRuleRepository();
export const commissionPayoutRepository = new CommissionPayoutRepository();
