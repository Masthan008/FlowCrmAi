import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export class SubscriptionRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.SubscriptionWhereInput;
    orderBy?: Prisma.SubscriptionOrderByWithRelationInput;
  }) {
    return prisma.subscription.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        plan: {
          select: { id: true, name: true, price: true, billingPeriod: true },
        },
      },
    });
  }

  async count(where?: Prisma.SubscriptionWhereInput) {
    return prisma.subscription.count({ where });
  }

  async findById(id: string) {
    return prisma.subscription.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        plan: {
          select: { id: true, name: true, price: true, billingPeriod: true },
        },
      },
    });
  }

  async create(data: Prisma.SubscriptionUncheckedCreateInput) {
    return prisma.subscription.create({
      data,
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        plan: {
          select: { id: true, name: true, price: true, billingPeriod: true },
        },
      },
    });
  }

  async update(id: string, data: Prisma.SubscriptionUncheckedUpdateInput) {
    return prisma.subscription.update({
      where: { id },
      data,
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        plan: {
          select: { id: true, name: true, price: true, billingPeriod: true },
        },
      },
    });
  }

  async softDelete(id: string, userId?: string) {
    return prisma.subscription.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId || null,
      },
    });
  }
}

export const subscriptionRepository = new SubscriptionRepository();
export default subscriptionRepository;
