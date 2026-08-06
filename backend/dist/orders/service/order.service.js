"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderService = void 0;
const order_repository_1 = require("../repository/order.repository");
const db_1 = require("../../database/db");
exports.orderService = {
    getOrders: async (params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (params.search) {
            where.orderNumber = { contains: params.search, mode: 'insensitive' };
        }
        if (params.status) {
            where.status = params.status;
        }
        if (params.customerId) {
            where.customerId = params.customerId;
        }
        const [items, total] = await Promise.all([
            order_repository_1.orderRepository.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
            }),
            order_repository_1.orderRepository.count(where),
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
    getOrderById: async (id) => {
        const order = await order_repository_1.orderRepository.findById(id);
        if (!order || order.deletedAt) {
            throw Object.assign(new Error('Order not found'), { statusCode: 404 });
        }
        return order;
    },
    createOrder: async (data, userId) => {
        let customerId = data.customerId;
        if (customerId) {
            const customer = await db_1.prisma.customer.findUnique({ where: { id: customerId } });
            if (!customer) {
                throw Object.assign(new Error('Customer not found'), { statusCode: 400 });
            }
        }
        else {
            const fallback = await db_1.prisma.customer.findFirst({
                where: { deletedAt: null },
                orderBy: { createdAt: 'asc' },
                select: { id: true },
            });
            if (fallback) {
                customerId = fallback.id;
            }
            else {
                const walkIn = await db_1.prisma.customer.create({
                    data: { name: 'Walk-in Customer', createdBy: userId || null },
                    select: { id: true },
                });
                customerId = walkIn.id;
            }
        }
        return order_repository_1.orderRepository.createWithItems({ ...data, customerId }, userId);
    },
    updateOrder: async (id, data, userId) => {
        const existing = await order_repository_1.orderRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Order not found'), { statusCode: 404 });
        }
        const { items, ...orderFields } = data;
        return order_repository_1.orderRepository.update(id, { ...orderFields, updatedBy: userId || null });
    },
    deleteOrder: async (id, userId) => {
        const existing = await order_repository_1.orderRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Order not found'), { statusCode: 404 });
        }
        return order_repository_1.orderRepository.softDelete(id, userId);
    },
    updateOrderStatus: async (id, status, userId) => {
        const existing = await order_repository_1.orderRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Order not found'), { statusCode: 404 });
        }
        return order_repository_1.orderRepository.update(id, { status, updatedBy: userId || null });
    },
};
exports.default = exports.orderService;
