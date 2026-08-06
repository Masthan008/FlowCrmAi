"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionRepository = exports.SubscriptionRepository = void 0;
const db_1 = require("../../database/db");
class SubscriptionRepository {
    async findMany(params) {
        return db_1.prisma.subscription.findMany({
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
    async count(where) {
        return db_1.prisma.subscription.count({ where });
    }
    async findById(id) {
        return db_1.prisma.subscription.findUnique({
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
    async create(data) {
        return db_1.prisma.subscription.create({
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
    async update(id, data) {
        return db_1.prisma.subscription.update({
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
    async softDelete(id, userId) {
        return db_1.prisma.subscription.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy: userId || null,
            },
        });
    }
}
exports.SubscriptionRepository = SubscriptionRepository;
exports.subscriptionRepository = new SubscriptionRepository();
exports.default = exports.subscriptionRepository;
