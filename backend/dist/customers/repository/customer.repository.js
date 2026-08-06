"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerRepository = void 0;
const db_1 = require("../../database/db");
exports.customerRepository = {
    findMany: async (params) => {
        const page = Number(params.page) || 1;
        const limit = Number(params.limit) || 20;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
            ...(params.type && { type: params.type }),
            ...(params.status && { status: params.status }),
            ...(params.search && {
                OR: [
                    { name: { contains: params.search, mode: 'insensitive' } },
                    { email: { contains: params.search, mode: 'insensitive' } },
                    { phone: { contains: params.search, mode: 'insensitive' } },
                ],
            }),
        };
        const [items, totalItems] = await Promise.all([
            db_1.prisma.customer.findMany({
                where,
                skip,
                take: limit,
                include: {
                    company: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            db_1.prisma.customer.count({ where }),
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
        return db_1.prisma.customer.findFirst({
            where: { id, deletedAt: null },
            include: {
                company: true,
                contacts: { where: { deletedAt: null } },
                leads: { where: { deletedAt: null } },
                deals: { where: { deletedAt: null } },
                quotes: { where: { deletedAt: null } },
                invoices: { where: { deletedAt: null } },
                tickets: { where: { deletedAt: null } },
            },
        });
    },
    create: async (data) => {
        return db_1.prisma.customer.create({
            data,
            include: {
                company: { select: { id: true, name: true } },
            },
        });
    },
    update: async (id, data) => {
        return db_1.prisma.customer.update({
            where: { id },
            data,
            include: {
                company: { select: { id: true, name: true } },
            },
        });
    },
    delete: async (id, deletedBy) => {
        return db_1.prisma.customer.update({
            where: { id },
            data: { deletedAt: new Date(), deletedBy },
        });
    },
};
