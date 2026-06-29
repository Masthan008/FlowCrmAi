import { z } from 'zod';

export const createDealSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(200),
    opportunityName: z.string().max(200).optional().or(z.literal('')),
    customerId: z.string().uuid('Invalid customer ID'),
    companyId: z.string().uuid('Invalid company ID').optional().or(z.literal('')),
    primaryContactId: z.string().uuid('Invalid contact ID').optional().or(z.literal('')),
    leadId: z.string().uuid('Invalid lead ID').optional().or(z.literal('')),
    pipelineId: z.string().uuid('Invalid pipeline ID').optional().or(z.literal('')),
    stageId: z.string().uuid('Invalid stage ID'),
    assignedToId: z.string().uuid('Invalid owner ID').optional().or(z.literal('')),
    status: z.enum(['Open', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'Cancelled', 'On Hold', 'Archived']).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    probability: z.number().min(0).max(100).optional(),
    value: z.number().min(0).optional(),
    expectedRevenue: z.number().min(0).optional(),
    expectedCloseDate: z.string().datetime({ offset: true }).optional().or(z.literal('')),
    actualCloseDate: z.string().datetime({ offset: true }).optional().or(z.literal('')),
    currency: z.string().max(10).optional(),
    source: z.string().max(100).optional().or(z.literal('')),
    industry: z.string().max(100).optional().or(z.literal('')),
    businessType: z.string().max(100).optional().or(z.literal('')),
    description: z.string().max(5000).optional().or(z.literal('')),
    tags: z.array(z.string()).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateDealSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    opportunityName: z.string().max(200).optional().or(z.literal('')),
    customerId: z.string().uuid('Invalid customer ID').optional(),
    companyId: z.string().uuid('Invalid company ID').optional().or(z.literal('')),
    primaryContactId: z.string().uuid('Invalid contact ID').optional().or(z.literal('')),
    leadId: z.string().uuid('Invalid lead ID').optional().or(z.literal('')),
    pipelineId: z.string().uuid('Invalid pipeline ID').optional().or(z.literal('')),
    stageId: z.string().uuid('Invalid stage ID').optional(),
    assignedToId: z.string().uuid('Invalid owner ID').optional().or(z.literal('')),
    status: z.enum(['Open', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'Cancelled', 'On Hold', 'Archived']).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    probability: z.number().min(0).max(100).optional(),
    value: z.number().min(0).optional(),
    expectedRevenue: z.number().min(0).optional(),
    expectedCloseDate: z.string().datetime({ offset: true }).optional().or(z.literal('')),
    actualCloseDate: z.string().datetime({ offset: true }).optional().or(z.literal('')),
    currency: z.string().max(10).optional(),
    source: z.string().max(100).optional().or(z.literal('')),
    industry: z.string().max(100).optional().or(z.literal('')),
    businessType: z.string().max(100).optional().or(z.literal('')),
    description: z.string().max(5000).optional().or(z.literal('')),
    tags: z.array(z.string()).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
  params: z.object({
    id: z.string().uuid('Invalid deal ID'),
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
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().optional(),
    status: z.string().optional(),
    pipelineId: z.string().uuid().optional(),
    stageId: z.string().uuid().optional(),
    ownerId: z.string().uuid().optional(),
    priority: z.string().optional(),
    source: z.string().optional(),
    industry: z.string().optional(),
    companyId: z.string().uuid().optional(),
    valueMin: z.string().regex(/^\d+(\.\d+)?$/).optional(),
    valueMax: z.string().regex(/^\d+(\.\d+)?$/).optional(),
    probabilityMin: z.string().regex(/^\d+(\.\d+)?$/).optional(),
    probabilityMax: z.string().regex(/^\d+(\.\d+)?$/).optional(),
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
    sortDir: z.enum(['asc', 'desc']).optional(),
  }),
});

export const getDealByIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid('Invalid deal ID'),
  }),
  query: z.object({}).optional(),
});
