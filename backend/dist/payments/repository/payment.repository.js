"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRepository = void 0;
const db_1 = require("../../database/db");
exports.paymentRepository = {
    findMany: async (params) => {
        const page = Number(params.page) || 1;
        const limit = Number(params.limit) || 20;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
            ...(params.status && { status: params.status }),
            ...(params.invoiceId && { invoiceId: params.invoiceId }),
            ...(params.search && {
                OR: [
                    { method: { contains: params.search, mode: 'insensitive' } },
                    { transactionId: { contains: params.search, mode: 'insensitive' } },
                ],
            }),
        };
        const [items, totalItems] = await Promise.all([
            db_1.prisma.payment.findMany({
                where,
                skip,
                take: limit,
                include: {
                    invoice: {
                        select: {
                            id: true,
                            number: true,
                            total: true,
                            customer: { select: { id: true, name: true } },
                        },
                    },
                    currency: { select: { id: true, code: true, symbol: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            db_1.prisma.payment.count({ where }),
        ]);
        return {
            items,
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
        };
    },
    findById: async (id) => {
        return db_1.prisma.payment.findFirst({
            where: { id, deletedAt: null },
            include: {
                invoice: {
                    include: { customer: true, items: true },
                },
                currency: true,
            },
        });
    },
    create: async (data) => {
        return db_1.prisma.payment.create({
            data,
            include: {
                invoice: { select: { id: true, number: true } },
                currency: { select: { id: true, code: true, symbol: true } },
            },
        });
    },
    update: async (id, data) => {
        return db_1.prisma.payment.update({
            where: { id },
            data,
            include: {
                invoice: { select: { id: true, number: true } },
                currency: { select: { id: true, code: true, symbol: true } },
            },
        });
    },
    delete: async (id, deletedBy) => {
        return db_1.prisma.payment.update({
            where: { id },
            data: { deletedAt: new Date(), deletedBy },
        });
    },
};
