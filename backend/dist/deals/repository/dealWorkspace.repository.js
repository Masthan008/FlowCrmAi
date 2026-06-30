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
    addProductLine: async (data) => {
        return db_1.prisma.dealProduct.create({ data });
    },
    updateProductLine: async (id, data) => {
        return db_1.prisma.dealProduct.update({
            where: { id },
            data,
        });
    },
    deleteProductLine: async (id, deletedBy) => {
        return db_1.prisma.dealProduct.update({
            where: { id },
            data: { deletedAt: new Date(), deletedBy },
        });
    },
    findProductById: async (id) => {
        return db_1.prisma.dealProduct.findFirst({
            where: { id, deletedAt: null }
        });
    },
    // QUOTES
    findQuotesByDealId: async (dealId, search) => {
        const items = await db_1.prisma.dealQuote.findMany({
            where: {
                dealId,
                deletedAt: null,
                ...(search && { quoteNumber: { contains: search, mode: 'insensitive' } }),
            },
            include: {
                versions: { orderBy: { createdAt: 'desc' } }
            },
            orderBy: { createdAt: 'desc' },
        });
        // Seed dummy quotes for MVP if empty to display dynamic layout
        if (items.length === 0 && !search) {
            const q = await db_1.prisma.dealQuote.create({
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
            await db_1.prisma.dealQuoteVersion.create({
                data: {
                    dealQuoteId: q.id,
                    version: '1.0',
                    status: 'sent',
                    amount: 4350.00,
                    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                    changes: 'Initial quote release',
                    createdBy: 'system'
                }
            });
            return db_1.prisma.dealQuote.findMany({ where: { dealId, deletedAt: null }, include: { versions: true } });
        }
        return items;
    },
    createQuote: async (data) => {
        const quote = await db_1.prisma.dealQuote.create({ data });
        // Auto-create version 1
        await db_1.prisma.dealQuoteVersion.create({
            data: {
                dealQuoteId: quote.id,
                version: data.version,
                status: data.status,
                amount: data.amount,
                expiryDate: data.expiryDate,
                changes: 'Initial release',
                createdBy: data.createdBy
            }
        });
        return quote;
    },
    updateQuote: async (id, data) => {
        const existing = await db_1.prisma.dealQuote.findUnique({ where: { id } });
        if (!existing)
            throw new Error('Quote not found');
        const updated = await db_1.prisma.dealQuote.update({
            where: { id },
            data,
        });
        // Create a new version record
        await db_1.prisma.dealQuoteVersion.create({
            data: {
                dealQuoteId: id,
                version: data.version || existing.version,
                status: data.status || existing.status,
                amount: data.amount || existing.amount,
                expiryDate: data.expiryDate || existing.expiryDate,
                changes: `Updated quote values by ${data.updatedBy || 'user'}`,
                createdBy: data.updatedBy
            }
        });
        return updated;
    },
    approveQuote: async (id, updatedBy) => {
        return db_1.prisma.dealQuote.update({
            where: { id },
            data: { status: 'Approved', updatedBy },
        });
    },
    rejectQuote: async (id, updatedBy) => {
        return db_1.prisma.dealQuote.update({
            where: { id },
            data: { status: 'Rejected', updatedBy },
        });
    },
    findQuoteById: async (id) => {
        return db_1.prisma.dealQuote.findFirst({
            where: { id, deletedAt: null }
        });
    },
    // COMPETITORS
    findCompetitorsByDealId: async (dealId, search) => {
        const items = await db_1.prisma.dealCompetitor.findMany({
            where: {
                dealId,
                deletedAt: null,
                ...(search && { name: { contains: search, mode: 'insensitive' } }),
            },
            orderBy: { createdAt: 'desc' },
        });
        // Seed dummy competitor for MVP
        if (items.length === 0 && !search) {
            await db_1.prisma.dealCompetitor.create({
                data: {
                    dealId,
                    name: 'Salesforce Enterprise',
                    product: 'Sales Cloud',
                    pricing: 150.00,
                    strengths: 'Strong brand presence, massive ecosystem, rich third-party extensions.',
                    weaknesses: 'Extremely high licensing costs, complex setup, hidden API charges.',
                    status: 'Active',
                    marketPosition: 'Market Leader',
                    website: 'https://salesforce.com',
                    notes: 'Customer is reviewing Salesforce pricing sheet against our proposal.',
                    createdBy: 'system'
                }
            });
            return db_1.prisma.dealCompetitor.findMany({ where: { dealId, deletedAt: null } });
        }
        return items;
    },
    createCompetitor: async (data) => {
        return db_1.prisma.dealCompetitor.create({ data });
    },
    // COLLABORATION COMMENTS
    findCommentsByDealId: async (dealId) => {
        return db_1.prisma.dealComment.findMany({
            where: { dealId, deletedAt: null },
            include: {
                employee: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
    },
    createComment: async (data) => {
        return db_1.prisma.dealComment.create({
            data,
            include: {
                employee: { select: { id: true, firstName: true, lastName: true } }
            }
        });
    },
    // CHECKLIST
    findChecklistByDealId: async (dealId) => {
        const items = await db_1.prisma.dealChecklist.findMany({
            where: { dealId },
            orderBy: { order: 'asc' }
        });
        // Seed default checklists
        if (items.length === 0) {
            await db_1.prisma.dealChecklist.createMany({
                data: [
                    { dealId, name: 'Discovery Completed', isCompleted: true, order: 0, createdBy: 'system' },
                    { dealId, name: 'Requirements Confirmed', isCompleted: false, order: 1, createdBy: 'system' },
                    { dealId, name: 'Demo Completed', isCompleted: false, order: 2, createdBy: 'system' },
                    { dealId, name: 'Proposal Sent', isCompleted: false, order: 3, createdBy: 'system' },
                    { dealId, name: 'Negotiation Completed', isCompleted: false, order: 4, createdBy: 'system' },
                    { dealId, name: 'Contract Reviewed', isCompleted: false, order: 5, createdBy: 'system' },
                    { dealId, name: 'Approval Received', isCompleted: false, order: 6, createdBy: 'system' },
                ]
            });
            return db_1.prisma.dealChecklist.findMany({ where: { dealId }, orderBy: { order: 'asc' } });
        }
        return items;
    },
    updateChecklistItem: async (id, isCompleted, completedBy) => {
        return db_1.prisma.dealChecklist.update({
            where: { id },
            data: {
                isCompleted,
                completedAt: isCompleted ? new Date() : null,
                completedBy: isCompleted ? completedBy : null,
            }
        });
    },
    findChecklistItemById: async (id) => {
        return db_1.prisma.dealChecklist.findUnique({ where: { id } });
    },
    // NEGOTIATIONS
    findNegotiationsByDealId: async (dealId) => {
        const items = await db_1.prisma.dealNegotiation.findMany({
            where: { dealId },
            orderBy: { round: 'desc' }
        });
        // Seed default round if empty
        if (items.length === 0) {
            await db_1.prisma.dealNegotiation.create({
                data: {
                    dealId,
                    round: 1,
                    currentOffer: 4350.00,
                    counterOffer: 4000.00,
                    discountPercent: 8.0,
                    requestedChanges: 'Requires 30 days payment terms instead of upfront.',
                    notes: 'Customer requested discount to fit budget constraints.',
                    status: 'Active',
                    createdBy: 'system'
                }
            });
            return db_1.prisma.dealNegotiation.findMany({ where: { dealId }, orderBy: { round: 'desc' } });
        }
        return items;
    },
    createNegotiation: async (data) => {
        return db_1.prisma.dealNegotiation.create({ data });
    },
    // TEAM MEMBERS
    findTeamMembersByDealId: async (dealId) => {
        const items = await db_1.prisma.dealTeamMember.findMany({
            where: { dealId },
            include: {
                employee: { select: { id: true, firstName: true, lastName: true, email: true } }
            }
        });
        // Seed default team members if empty
        if (items.length === 0) {
            const owner = await db_1.prisma.deal.findUnique({
                where: { id: dealId },
                select: { assignedToId: true }
            });
            if (owner?.assignedToId) {
                await db_1.prisma.dealTeamMember.create({
                    data: {
                        dealId,
                        employeeId: owner.assignedToId,
                        role: 'Deal Owner',
                        permissions: ['view', 'edit']
                    }
                });
            }
            return db_1.prisma.dealTeamMember.findMany({
                where: { dealId },
                include: { employee: true }
            });
        }
        return items;
    },
};
