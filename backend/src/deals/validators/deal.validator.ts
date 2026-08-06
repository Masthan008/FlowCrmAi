import { z } from 'zod';

export const createDealSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').or(z.any()),
    opportunityName: z.string().optional().nullable().or(z.literal('')),
    customerId: z.string().optional().nullable().or(z.literal('')),
    companyId: z.string().optional().nullable().or(z.literal('')),
    primaryContactId: z.string().optional().nullable().or(z.literal('')),
    leadId: z.string().optional().nullable().or(z.literal('')),
    pipelineId: z.string().optional().nullable().or(z.literal('')),
    stageId: z.string().optional().nullable().or(z.literal('')),
    assignedToId: z.string().optional().nullable().or(z.literal('')),
    status: z.string().optional().nullable(),
    priority: z.string().optional().nullable(),
    probability: z.union([z.number(), z.string()]).optional().nullable(),
    value: z.union([z.number(), z.string()]).optional().nullable(),
    expectedRevenue: z.union([z.number(), z.string()]).optional().nullable(),
    expectedCloseDate: z.any().optional().nullable(),
    actualCloseDate: z.any().optional().nullable(),
    currency: z.string().optional().nullable(),
    source: z.string().optional().nullable(),
    industry: z.string().optional().nullable(),
    businessType: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    tags: z.any().optional().nullable(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateDealSchema = z.object({
  body: z.object({
    name: z.string().optional().nullable(),
    opportunityName: z.string().optional().nullable(),
    customerId: z.string().optional().nullable(),
    companyId: z.string().optional().nullable(),
    primaryContactId: z.string().optional().nullable(),
    leadId: z.string().optional().nullable(),
    pipelineId: z.string().optional().nullable(),
    stageId: z.string().optional().nullable(),
    assignedToId: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    priority: z.string().optional().nullable(),
    probability: z.union([z.number(), z.string()]).optional().nullable(),
    value: z.union([z.number(), z.string()]).optional().nullable(),
    expectedRevenue: z.union([z.number(), z.string()]).optional().nullable(),
    expectedCloseDate: z.any().optional().nullable(),
    actualCloseDate: z.any().optional().nullable(),
    currency: z.string().optional().nullable(),
    source: z.string().optional().nullable(),
    industry: z.string().optional().nullable(),
    businessType: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    tags: z.any().optional().nullable(),
  }),
  params: z.object({
    id: z.string().optional(),
  }),
  query: z.object({}).optional(),
});

export const bulkUpdateStatusSchema = z.object({
  body: z.object({
    ids: z.array(z.string().uuid('Invalid deal ID')).min(1, 'At least one ID required'),
    status: z.enum(['Open', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'Cancelled', 'On Hold', 'Archived']),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateStageSchema = z.object({
  body: z.object({
    id: z.string().uuid('Invalid deal ID'),
    stageId: z.string().uuid('Invalid stage ID'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const bulkUpdateOwnerSchema = z.object({
  body: z.object({
    ids: z.array(z.string().uuid('Invalid deal ID')).min(1, 'At least one ID required'),
    ownerId: z.string().uuid('Invalid owner ID'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const listDealsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    status: z.string().optional(),
    pipelineId: z.string().optional().nullable(),
    stageId: z.string().optional().nullable(),
    ownerId: z.string().optional().nullable(),
    assignedToId: z.string().optional().nullable(),
    priority: z.string().optional(),
    source: z.string().optional(),
    industry: z.string().optional(),
    companyId: z.string().optional().nullable(),
    valueMin: z.string().optional(),
    valueMax: z.string().optional(),
    probabilityMin: z.string().optional(),
    probabilityMax: z.string().optional(),
    closeDateFrom: z.string().optional(),
    closeDateTo: z.string().optional(),
    createdFrom: z.string().optional(),
    createdTo: z.string().optional(),
    myDeals: z.string().optional(),
    open: z.string().optional(),
    won: z.string().optional(),
    lost: z.string().optional(),
    closingThisMonth: z.string().optional(),
    highProbability: z.string().optional(),
    highValue: z.string().optional(),
    recentlyCreated: z.string().optional(),
    sortBy: z.string().optional(),
    sortDir: z.string().optional(),
  }),
});

export const getDealByIdSchema = z.object({
  body: z.any().optional(),
  params: z.object({
    id: z.string().uuid('Invalid deal ID'),
  }),
  query: z.any().optional(),
});
