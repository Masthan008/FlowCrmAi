"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDealByIdSchema = exports.listDealsSchema = exports.bulkUpdateOwnerSchema = exports.updateStageSchema = exports.bulkUpdateStatusSchema = exports.updateDealSchema = exports.createDealSchema = void 0;
const zod_1 = require("zod");
exports.createDealSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name is required').max(200),
        opportunityName: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
        customerId: zod_1.z.string().uuid('Invalid customer ID'),
        companyId: zod_1.z.string().uuid('Invalid company ID').optional().or(zod_1.z.literal('')),
        primaryContactId: zod_1.z.string().uuid('Invalid contact ID').optional().or(zod_1.z.literal('')),
        leadId: zod_1.z.string().uuid('Invalid lead ID').optional().or(zod_1.z.literal('')),
        pipelineId: zod_1.z.string().uuid('Invalid pipeline ID').optional().or(zod_1.z.literal('')),
        stageId: zod_1.z.string().uuid('Invalid stage ID'),
        assignedToId: zod_1.z.string().uuid('Invalid owner ID').optional().or(zod_1.z.literal('')),
        status: zod_1.z.enum(['Open', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'Cancelled', 'On Hold', 'Archived']).optional(),
        priority: zod_1.z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
        probability: zod_1.z.number().min(0).max(100).optional(),
        value: zod_1.z.number().min(0).optional(),
        expectedRevenue: zod_1.z.number().min(0).optional(),
        expectedCloseDate: zod_1.z.string().datetime({ offset: true }).optional().or(zod_1.z.literal('')),
        actualCloseDate: zod_1.z.string().datetime({ offset: true }).optional().or(zod_1.z.literal('')),
        currency: zod_1.z.string().max(10).optional(),
        source: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        industry: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        businessType: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        description: zod_1.z.string().max(5000).optional().or(zod_1.z.literal('')),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
    }),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object({}).optional(),
});
exports.updateDealSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(200).optional(),
        opportunityName: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
        customerId: zod_1.z.string().uuid('Invalid customer ID').optional(),
        companyId: zod_1.z.string().uuid('Invalid company ID').optional().or(zod_1.z.literal('')),
        primaryContactId: zod_1.z.string().uuid('Invalid contact ID').optional().or(zod_1.z.literal('')),
        leadId: zod_1.z.string().uuid('Invalid lead ID').optional().or(zod_1.z.literal('')),
        pipelineId: zod_1.z.string().uuid('Invalid pipeline ID').optional().or(zod_1.z.literal('')),
        stageId: zod_1.z.string().uuid('Invalid stage ID').optional(),
        assignedToId: zod_1.z.string().uuid('Invalid owner ID').optional().or(zod_1.z.literal('')),
        status: zod_1.z.enum(['Open', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'Cancelled', 'On Hold', 'Archived']).optional(),
        priority: zod_1.z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
        probability: zod_1.z.number().min(0).max(100).optional(),
        value: zod_1.z.number().min(0).optional(),
        expectedRevenue: zod_1.z.number().min(0).optional(),
        expectedCloseDate: zod_1.z.string().datetime({ offset: true }).optional().or(zod_1.z.literal('')),
        actualCloseDate: zod_1.z.string().datetime({ offset: true }).optional().or(zod_1.z.literal('')),
        currency: zod_1.z.string().max(10).optional(),
        source: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        industry: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        businessType: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        description: zod_1.z.string().max(5000).optional().or(zod_1.z.literal('')),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
    }).refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update',
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid deal ID'),
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
        page: zod_1.z.string().regex(/^\d+$/).optional(),
        limit: zod_1.z.string().regex(/^\d+$/).optional(),
        search: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        pipelineId: zod_1.z.string().uuid().optional(),
        stageId: zod_1.z.string().uuid().optional(),
        ownerId: zod_1.z.string().uuid().optional(),
        priority: zod_1.z.string().optional(),
        source: zod_1.z.string().optional(),
        industry: zod_1.z.string().optional(),
        companyId: zod_1.z.string().uuid().optional(),
        valueMin: zod_1.z.string().regex(/^\d+(\.\d+)?$/).optional(),
        valueMax: zod_1.z.string().regex(/^\d+(\.\d+)?$/).optional(),
        probabilityMin: zod_1.z.string().regex(/^\d+(\.\d+)?$/).optional(),
        probabilityMax: zod_1.z.string().regex(/^\d+(\.\d+)?$/).optional(),
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
        sortDir: zod_1.z.enum(['asc', 'desc']).optional(),
    }),
});
exports.getDealByIdSchema = zod_1.z.object({
    body: zod_1.z.object({}).optional(),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid deal ID'),
    }),
    query: zod_1.z.object({}).optional(),
});
