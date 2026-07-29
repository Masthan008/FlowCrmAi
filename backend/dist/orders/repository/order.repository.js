"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRepository = exports.OrderRepository = void 0;
const db_1 = require("../../database/db");
class OrderRepository {
    async findMany(params) {
        return db_1.prisma.order.findMany({
            skip: params.skip,
            take: params.take,
            where: params.where,
            orderBy: params.orderBy,
            include: {
                customer: {
                    select: { id: true, name: true, email: true },
                },
                items: true,
            },
        });
    }
    async count(where) {
        return db_1.prisma.order.count({ where });
    }
    async findById(id) {
        return db_1.prisma.order.findUnique({
            where: { id },
            include: {
                customer: {
                    select: { id: true, name: true, email: true },
                },
                items: true,
            },
        });
    }
    async create(data) {
        return db_1.prisma.order.create({
            data,
            include: {
                customer: {
                    select: { id: true, name: true, email: true },
                },
                items: true,
            },
        });
    }
    async createWithItems(data, userId) {
        const { items, ...orderData } = data;
        return db_1.prisma.order.create({
            data: {
                ...orderData,
                orderNumber: data.orderNumber || `ORD-${Date.now()}`,
                createdBy: userId || null,
                items: items && items.length > 0
                    ? {
                        create: items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            createdBy: userId || null,
                        })),
                    }
                    : undefined,
            },
            include: {
                customer: {
                    select: { id: true, name: true, email: true },
                },
                items: true,
            },
        });
    }
    async update(id, data) {
        return db_1.prisma.order.update({
            where: { id },
            data,
            include: {
                customer: {
                    select: { id: true, name: true, email: true },
                },
                items: true,
            },
        });
    }
    async softDelete(id, userId) {
        return db_1.prisma.order.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy: userId || null,
            },
        });
    }
}
exports.OrderRepository = OrderRepository;
exports.orderRepository = new OrderRepository();
exports.default = exports.orderRepository;
