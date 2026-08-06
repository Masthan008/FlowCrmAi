"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calendarRepository = void 0;
const db_1 = require("../../database/db");
exports.calendarRepository = {
    findMany: async (params) => {
        const page = Number(params.page) || 1;
        const limit = Number(params.limit) || 50;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
            ...(params.organizerId && { organizerId: params.organizerId }),
            ...(params.customerId && { customerId: params.customerId }),
            ...(params.dealId && { dealId: params.dealId }),
            ...(params.search && {
                OR: [
                    { title: { contains: params.search, mode: 'insensitive' } },
                    { description: { contains: params.search, mode: 'insensitive' } },
                    { location: { contains: params.search, mode: 'insensitive' } },
                ],
            }),
            ...(params.from && { startTime: { gte: new Date(params.from) } }),
            ...(params.to && { endTime: { lte: new Date(params.to) } }),
        };
        const [items, totalItems] = await Promise.all([
            db_1.prisma.meeting.findMany({
                where,
                skip,
                take: limit,
                include: {
                    organizer: { select: { id: true, firstName: true, lastName: true, email: true } },
                    customer: { select: { id: true, name: true, email: true } },
                    deal: { select: { id: true, name: true } },
                },
                orderBy: { startTime: 'asc' },
            }),
            db_1.prisma.meeting.count({ where }),
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
        return db_1.prisma.meeting.findFirst({
            where: { id, deletedAt: null },
            include: {
                organizer: true,
                customer: true,
                deal: true,
            },
        });
    },
    create: async (data) => {
        return db_1.prisma.meeting.create({
            data,
            include: {
                organizer: { select: { id: true, firstName: true, lastName: true, email: true } },
                customer: { select: { id: true, name: true } },
                deal: { select: { id: true, name: true } },
            },
        });
    },
    update: async (id, data) => {
        return db_1.prisma.meeting.update({
            where: { id },
            data,
            include: {
                organizer: { select: { id: true, firstName: true, lastName: true, email: true } },
                customer: { select: { id: true, name: true } },
                deal: { select: { id: true, name: true } },
            },
        });
    },
    delete: async (id, deletedBy) => {
        return db_1.prisma.meeting.update({
            where: { id },
            data: { deletedAt: new Date(), deletedBy },
        });
    },
};
