"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealWorkspaceRepository = void 0;
const db_1 = require("../../database/db");
exports.dealWorkspaceRepository = {
    // NOTES
    findNotesByDealId: async (dealId, search) => {
        return db_1.prisma.dealNote.findMany({
            where: {
                dealId,
                deletedAt: null,
                ...(search && {
                    OR: [
                        { content: { contains: search, mode: 'insensitive' } },
                        { title: { contains: search, mode: 'insensitive' } },
                    ],
                }),
            },
            orderBy: [
                { isPinned: 'desc' },
                { createdAt: 'desc' },
            ],
        });
    },
    findNoteById: async (id) => {
        return db_1.prisma.dealNote.findFirst({
            where: { id, deletedAt: null }
        });
    },
    createNote: async (data) => {
        return db_1.prisma.dealNote.create({ data });
    },
    updateNote: async (id, data) => {
        return db_1.prisma.dealNote.update({
            where: { id },
            data,
        });
    },
    deleteNote: async (id, deletedBy) => {
        return db_1.prisma.dealNote.update({
            where: { id },
            data: { deletedAt: new Date(), deletedBy },
        });
    },
    // ACTIVITIES
    findActivitiesByDealId: async (dealId, filters) => {
        const { type, priority, status, search } = filters;
        return db_1.prisma.dealActivity.findMany({
            where: {
                dealId,
                deletedAt: null,
                ...(type && { type }),
                ...(priority && { priority }),
                ...(status && { status }),
                ...(search && {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                    ],
                }),
            },
            include: {
                assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
            orderBy: { activityDate: 'desc' },
        });
    },
    findActivityById: async (id) => {
        return db_1.prisma.dealActivity.findFirst({
            where: { id, deletedAt: null }
        });
    },
    createActivity: async (data) => {
        return db_1.prisma.dealActivity.create({
            data,
            include: {
                assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
        });
    },
    updateActivity: async (id, data) => {
        return db_1.prisma.dealActivity.update({
            where: { id },
            data,
            include: {
                assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
        });
    },
    deleteActivity: async (id, deletedBy) => {
        return db_1.prisma.dealActivity.update({
            where: { id },
            data: { deletedAt: new Date(), deletedBy },
        });
    },
    // FILES
    findFilesByDealId: async (dealId, search) => {
        return db_1.prisma.dealFile.findMany({
            where: {
                dealId,
                deletedAt: null,
                ...(search && { name: { contains: search, mode: 'insensitive' } }),
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    findFileById: async (id) => {
        return db_1.prisma.dealFile.findFirst({
            where: { id, deletedAt: null }
        });
    },
    createFile: async (data) => {
        return db_1.prisma.dealFile.create({ data });
    },
    deleteFile: async (id, deletedBy) => {
        return db_1.prisma.dealFile.update({
            where: { id },
            data: { deletedAt: new Date(), deletedBy },
        });
    },
    // TIMELINE
    findTimelineByDealId: async (dealId, search) => {
        return db_1.prisma.dealTimeline.findMany({
            where: {
                dealId,
                deletedAt: null,
                ...(search && {
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                    ],
                }),
            },
            orderBy: { eventDate: 'desc' },
        });
    },
    createTimelineEntry: async (data) => {
        return db_1.prisma.dealTimeline.create({ data });
    },
    // HISTORY
    findHistoryByDealId: async (dealId, search) => {
        return db_1.prisma.dealHistory.findMany({
            where: {
                dealId,
                deletedAt: null,
                ...(search && {
                    OR: [
                        { action: { contains: search, mode: 'insensitive' } },
                        { fieldName: { contains: search, mode: 'insensitive' } },
                    ],
                }),
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    createHistoryEntry: async (data) => {
        return db_1.prisma.dealHistory.create({ data });
    },
    // PRODUCTS
    findProductsByDealId: async (dealId, search) => {
        const items = await db_1.prisma.dealProduct.findMany({
            where: {
                dealId,
                deletedAt: null,
                ...(search && { name: { contains: search, mode: 'insensitive' } }),
            },
            orderBy: { createdAt: 'desc' },
        });
        // Seed dummy products for MVP if empty to display dynamic layout
        if (items.length === 0 && !search) {
            await db_1.prisma.dealProduct.createMany({
                data: [
                    { dealId, name: 'Enterprise CRM License', sku: 'CRM-ENT-101', quantity: 25, unitPrice: 120.00, discount: 500.00, tax: 200.00, subtotal: 3000.00, total: 2700.00, createdBy: 'system' },
                    { dealId, name: 'AI Prediction Module Integration', sku: 'CRM-AI-440', quantity: 1, unitPrice: 1500.00, discount: 0.00, tax: 150.00, subtotal: 1500.00, total: 1650.00, createdBy: 'system' }
                ]
            });
            return db_1.prisma.dealProduct.findMany({ where: { dealId, deletedAt: null } });
        }
        return items;
    },
    // QUOTES
    findQuotesByDealId: async (dealId, search) => {
        const items = await db_1.prisma.dealQuote.findMany({
            where: {
                dealId,
                deletedAt: null,
                ...(search && { quoteNumber: { contains: search, mode: 'insensitive' } }),
            },
            orderBy: { createdAt: 'desc' },
        });
        // Seed dummy quotes for MVP if empty to display dynamic layout
        if (items.length === 0 && !search) {
            await db_1.prisma.dealQuote.create({
                data: {
                    dealId,
                    quoteNumber: `QT-DEAL-${dealId.substring(0, 4).toUpperCase()}-01`,
                    version: '1.0',
                    status: 'sent',
                    amount: 4350.00,
                    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    createdBy: 'system'
                }
            });
            return db_1.prisma.dealQuote.findMany({ where: { dealId, deletedAt: null } });
        }
        return items;
    },
};
