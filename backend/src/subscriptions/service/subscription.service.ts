import { subscriptionRepository } from '../repository/subscription.repository';
import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export const subscriptionService = {
  listPlans: async () => {
    return prisma.subscriptionPlan.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  },

  createPlan: async (
    data: { name: string; description?: string; price: number; interval: string; features?: any },
    userId?: string
  ) => {
    return prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        billingPeriod: data.interval,
        features: data.features,
        createdBy: userId || null,
      },
    });
  },

  updatePlan: async (
    id: string,
    data: { name?: string; description?: string | null; price?: number; interval?: string; features?: any },
    userId?: string
  ) => {
    const existing = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Plan not found'), { statusCode: 404 });
    }
    return prisma.subscriptionPlan.update({
      where: { id },
      data: { ...data, interval: undefined, billingPeriod: data.interval, updatedBy: userId || null },
    });
  },

  deletePlan: async (id: string, userId?: string) => {
    const existing = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Plan not found'), { statusCode: 404 });
    }
    return prisma.subscriptionPlan.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: userId || null },
    });
  },

  getSubscriptions: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    customerId?: string;
    planId?: string;
  }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SubscriptionWhereInput = {
      deletedAt: null,
    };

    if (params.status) {
      where.status = params.status;
    }

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    if (params.planId) {
      where.planId = params.planId;
    }

    const [items, total] = await Promise.all([
      subscriptionRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      subscriptionRepository.count(where),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  getSubscriptionById: async (id: string) => {
    const subscription = await subscriptionRepository.findById(id);
    if (!subscription || subscription.deletedAt) {
      throw Object.assign(new Error('Subscription not found'), { statusCode: 404 });
    }
    return subscription;
  },

  createSubscription: async (
    data: {
      planName?: string | null;
      customerId?: string | null;
      planId?: string | null;
      status?: string;
      startDate?: string | null;
      endDate?: string | null;
    },
    userId?: string
  ) => {
    let custId = data.customerId;
    if (!custId) {
      const firstCust = await prisma.customer.findFirst();
      if (firstCust) {
        custId = firstCust.id;
      } else {
        const newCust = await prisma.customer.create({
          data: { name: 'Default Enterprise Customer', type: 'client', status: 'active', createdBy: userId || null }
        });
        custId = newCust.id;
      }
    }

    let planId = data.planId;
    if (!planId) {
      const firstPlan = await prisma.subscriptionPlan.findFirst({ where: { deletedAt: null } });
      if (firstPlan) {
        planId = firstPlan.id;
      } else {
        const newPlan = await prisma.subscriptionPlan.create({
          data: {
            name: data.planName || 'Enterprise Growth Plan',
            description: 'Standard enterprise recurring subscription plan',
            price: 199.00,
            billingPeriod: 'Monthly',
            createdBy: userId || null,
          }
        });
        planId = newPlan.id;
      }
    }

    const startDateObj = data.startDate ? new Date(data.startDate) : new Date();

    return subscriptionRepository.create({
      customerId: custId,
      planId,
      status: data.status || 'Active',
      startDate: isNaN(startDateObj.getTime()) ? new Date() : startDateObj,
      endDate: data.endDate && !isNaN(new Date(data.endDate).getTime()) ? new Date(data.endDate) : undefined,
      createdBy: userId || null,
    });
  },

  updateSubscription: async (
    id: string,
    data: Partial<{
      status: string;
      planId: string;
      endDate: string | null;
    }>,
    userId?: string
  ) => {
    const existing = await subscriptionRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Subscription not found'), { statusCode: 404 });
    }

    const updateData: any = { ...data, updatedBy: userId || null };
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;

    return subscriptionRepository.update(id, updateData);
  },

  cancelSubscription: async (id: string, userId?: string) => {
    const existing = await subscriptionRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Subscription not found'), { statusCode: 404 });
    }
    return subscriptionRepository.softDelete(id, userId);
  },

  updateSubscriptionStatus: async (id: string, status: string, userId?: string) => {
    const existing = await subscriptionRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Subscription not found'), { statusCode: 404 });
    }
    return subscriptionRepository.update(id, { status, updatedBy: userId || null });
  },
};

export default subscriptionService;
