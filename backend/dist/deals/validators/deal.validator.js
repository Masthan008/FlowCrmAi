"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDealByIdSchema = exports.listDealsSchema = exports.bulkUpdateOwnerSchema = exports.updateStageSchema = exports.bulkUpdateStatusSchema = exports.updateDealSchema = exports.createDealSchema = void 0;
const zod_1 = require("zod");
exports.createDealSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name is required').or(zod_1.z.any()),
        opportunityName: zod_1.z.string().optional().nullable().or(zod_1.z.literal('')),
        customerId: zod_1.z.string().optional().nullable().or(zod_1.z.literal('')),
        companyId: zod_1.z.string().optional().nullable().or(zod_1.z.literal('')),
        primaryContactId: zod_1.z.string().optional().nullable().or(zod_1.z.literal('')),
        leadId: zod_1.z.string().optional().nullable().or(zod_1.z.literal('')),
        pipelineId: zod_1.z.string().optional().nullable().or(zod_1.z.literal('')),
        stageId: zod_1.z.string().optional().nullable().or(zod_1.z.literal('')),
        assignedToId: zod_1.z.string().optional().nullable().or(zod_1.z.literal('')),
        status: zod_1.z.string().optional().nullable(),
        priority: zod_1.z.string().optional().nullable(),
        probability: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional().nullable(),
        value: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional().nullable(),
        expectedRevenue: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional().nullable(),
        expectedCloseDate: zod_1.z.any().optional().nullable(),
        actualCloseDate: zod_1.z.any().optional().nullable(),
        currency: zod_1.z.string().optional().nullable(),
        source: zod_1.z.string().optional().nullable(),
        industry: zod_1.z.string().optional().nullable(),
        businessType: zod_1.z.string().optional().nullable(),
        description: zod_1.z.string().optional().nullable(),
        tags: zod_1.z.any().optional().nullable(),
    }),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object({}).optional(),
});
exports.updateDealSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional().nullable(),
        opportunityName: zod_1.z.string().optional().nullable(),
        customerId: zod_1.z.string().optional().nullable(),
        companyId: zod_1.z.string().optional().nullable(),
        primaryContactId: zod_1.z.string().optional().nullable(),
        leadId: zod_1.z.string().optional().nullable(),
        pipelineId: zod_1.z.string().optional().nullable(),
        stageId: zod_1.z.string().optional().nullable(),
        assignedToId: zod_1.z.string().optional().nullable(),
        status: zod_1.z.string().optional().nullable(),
        priority: zod_1.z.string().optional().nullable(),
        probability: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional().nullable(),
        value: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional().nullable(),
        expectedRevenue: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional().nullable(),
        expectedCloseDate: zod_1.z.any().optional().nullable(),
        actualCloseDate: zod_1.z.any().optional().nullable(),
        currency: zod_1.z.string().optional().nullable(),
        source: zod_1.z.string().optional().nullable(),
        industry: zod_1.z.string().optional().nullable(),
        businessType: zod_1.z.string().optional().nullable(),
        description: zod_1.z.string().optional().nullable(),
        tags: zod_1.z.any().optional().nullable(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().optional(),
    }),
    query: zod_1.z.object({}).optional(),
});
exports.bulkUpdateStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string().uuid('Invalid deal ID')).min(1, 'At least one ID required'),
        status: zod_1.z.enum(['Open', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'Cancelled', 'On Hold', 'Archived']),
    }),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object({}).optional(),
});
exports.updateStageSchema = zod_1.z.object({
    body: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid deal ID'),
        stageId: zod_1.z.string().uuid('Invalid stage ID'),
    }),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object({}).optional(),
});
exports.bulkUpdateOwnerSchema = zod_1.z.object({
    body: zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string().uuid('Invalid deal ID')).min(1, 'At least one ID required'),
        ownerId: zod_1.z.string().uuid('Invalid owner ID'),
    }),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object({}).optional(),
});
exports.listDealsSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional(),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object({
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        search: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        pipelineId: zod_1.z.string().optional().nullable(),
        stageId: zod_1.z.string().optional().nullable(),
        ownerId: zod_1.z.string().optional().nullable(),
        assignedToId: zod_1.z.string().optional().nullable(),
        priority: zod_1.z.string().optional(),
        source: zod_1.z.string().optional(),
        industry: zod_1.z.string().optional(),
        companyId: zod_1.z.string().optional().nullable(),
        valueMin: zod_1.z.string().optional(),
        valueMax: zod_1.z.string().optional(),
        probabilityMin: zod_1.z.string().optional(),
        probabilityMax: zod_1.z.string().optional(),
        closeDateFrom: zod_1.z.string().optional(),
        closeDateTo: zod_1.z.string().optional(),
        createdFrom: zod_1.z.string().optional(),
        createdTo: zod_1.z.string().optional(),
        myDeals: zod_1.z.string().optional(),
        open: zod_1.z.string().optional(),
        won: zod_1.z.string().optional(),
        lost: zod_1.z.string().optional(),
        closingThisMonth: zod_1.z.string().optional(),
        highProbability: zod_1.z.string().optional(),
        highValue: zod_1.z.string().optional(),
        recentlyCreated: zod_1.z.string().optional(),
        sortBy: zod_1.z.string().optional(),
        sortDir: zod_1.z.string().optional(),
    }),
});
exports.getDealByIdSchema = zod_1.z.object({
    body: zod_1.z.any().optional(),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid deal ID'),
    }),
    query: zod_1.z.any().optional(),
});
