"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionService = void 0;
const subscription_repository_1 = require("../repository/subscription.repository");
const db_1 = require("../../database/db");
exports.subscriptionService = {
    listPlans: async () => {
        return db_1.prisma.subscriptionPlan.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
        });
    },
    createPlan: async (data, userId) => {
        return db_1.prisma.subscriptionPlan.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                interval: data.interval,
                features: data.features,
                createdBy: userId || null,
            },
        });
    },
    updatePlan: async (id, data, userId) => {
        const existing = await db_1.prisma.subscriptionPlan.findUnique({ where: { id } });
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Plan not found'), { statusCode: 404 });
        }
        return db_1.prisma.subscriptionPlan.update({
            where: { id },
            data: { ...data, updatedBy: userId || null },
        });
    },
    deletePlan: async (id, userId) => {
        const existing = await db_1.prisma.subscriptionPlan.findUnique({ where: { id } });
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Plan not found'), { statusCode: 404 });
        }
        return db_1.prisma.subscriptionPlan.update({
            where: { id },
            data: { deletedAt: new Date(), deletedBy: userId || null },
        });
    },
    getSubscriptions: async (params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
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
            subscription_repository_1.subscriptionRepository.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
            }),
            subscription_repository_1.subscriptionRepository.count(where),
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
    getSubscriptionById: async (id) => {
        const subscription = await subscription_repository_1.subscriptionRepository.findById(id);
        if (!subscription || subscription.deletedAt) {
            throw Object.assign(new Error('Subscription not found'), { statusCode: 404 });
        }
        return subscription;
    },
    createSubscription: async (data, userId) => {
        if (data.customerId) {
            const customer = await db_1.prisma.customer.findUnique({ where: { id: data.customerId } });
            if (!customer) {
                throw Object.assign(new Error('Customer not found'), { statusCode: 400 });
            }
        }
        const plan = await db_1.prisma.subscriptionPlan.findUnique({ where: { id: data.planId } });
        if (!plan) {
            throw Object.assign(new Error('Plan not found'), { statusCode: 400 });
        }
        return subscription_repository_1.subscriptionRepository.create({
            customerId: data.customerId,
            planId: data.planId,
            status: data.status || 'Active',
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : undefined,
            createdBy: userId || null,
        });
    },
    updateSubscription: async (id, data, userId) => {
        const existing = await subscription_repository_1.subscriptionRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Subscription not found'), { statusCode: 404 });
        }
        const updateData = { ...data, updatedBy: userId || null };
        if (data.endDate !== undefined)
            updateData.endDate = data.endDate ? new Date(data.endDate) : null;
        return subscription_repository_1.subscriptionRepository.update(id, updateData);
    },
    cancelSubscription: async (id, userId) => {
        const existing = await subscription_repository_1.subscriptionRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Subscription not found'), { statusCode: 404 });
        }
        return subscription_repository_1.subscriptionRepository.softDelete(id, userId);
    },
    updateSubscriptionStatus: async (id, status, userId) => {
        const existing = await subscription_repository_1.subscriptionRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Subscription not found'), { statusCode: 404 });
        }
        return subscription_repository_1.subscriptionRepository.update(id, { status, updatedBy: userId || null });
    },
};
exports.default = exports.subscriptionService;
