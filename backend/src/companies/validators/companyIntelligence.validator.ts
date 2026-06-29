import { z } from 'zod';

const lifecycleStages = [
  'Prospect', 'Qualified', 'Customer', 'VIP Customer', 'Partner',
  'Vendor', 'Distributor', 'Inactive', 'Lost Customer', 'Archived',
] as const;

const segmentMatchTypes = ['ALL', 'ANY'] as const;

const workflowTriggers = [
  'company_created', 'status_changed', 'lifecycle_changed', 'owner_changed',
  'revenue_updated', 'deal_closed', 'invoice_generated', 'payment_received', 'branch_added',
] as const;

const recommendationTypes = ['upsell', 'cross_sell', 'renewal_reminder', 'contact_time', 'risk_warning', 'follow_up', 'general'] as const;

const followupTypes = ['Business Review', 'Renewal', 'Contract Discussion', 'Quarterly Meeting', 'Executive Meeting', 'Sales Visit', 'Customer Success Review', 'Escalation'] as const;

export const updateLifecycleSchema = z.object({
  body: z.object({
    currentStage: z.enum(lifecycleStages),
    changeReason: z.string().max(500).optional().or(z.literal('')),
  }),
  params: z.object({ id: z.string().uuid('Invalid company ID') }),
  query: z.object({}).optional(),
});

export const getScoreSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid company ID') }),
  query: z.object({}).optional(),
  body: z.object({}).optional(),
});

export const getHealthSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid company ID') }),
  query: z.object({}).optional(),
  body: z.object({}).optional(),
});

export const getRiskSchema = z.object({
  params: z.object({ id: z.string().uuid('Invalid company ID') }),
  query: z.object({}).optional(),
  body: z.object({}).optional(),
});

const segmentRuleSchema = z.object({
  field: z.string().min(1, 'Field is required'),
  operator: z.string().min(1, 'Operator is required'),
  value: z.string().min(1, 'Value is required'),
  value2: z.string().optional().or(z.literal('')),
  logicGroup: z.string().optional(),
});

export const createSegmentSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Segment name is required').max(100),
    description: z.string().max(500).optional().or(z.literal('')),
    color: z.string().max(20).optional().or(z.literal('')),
    icon: z.string().max(50).optional().or(z.literal('')),
    isDynamic: z.boolean().optional(),
    matchType: z.enum(segmentMatchTypes).optional(),
    rules: z.array(segmentRuleSchema).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateSegmentSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional().or(z.literal('')),
    color: z.string().max(20).optional().or(z.literal('')),
    icon: z.string().max(50).optional().or(z.literal('')),
    isDynamic: z.boolean().optional(),
    matchType: z.enum(segmentMatchTypes).optional(),
    rules: z.array(segmentRuleSchema).optional(),
  }),
  params: z.object({ id: z.string().uuid('Invalid segment ID') }),
  query: z.object({}).optional(),
});

export const createTagSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Tag name is required').max(50),
    color: z.string().max(20).optional().or(z.literal('')),
    description: z.string().max(200).optional().or(z.literal('')),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateTagSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(50).optional(),
    color: z.string().max(20).optional().or(z.literal('')),
    description: z.string().max(200).optional().or(z.literal('')),
  }),
  params: z.object({ id: z.string().uuid('Invalid tag ID') }),
  query: z.object({}).optional(),
});

export const assignTagsSchema = z.object({
  body: z.object({
    tagIds: z.array(z.string().uuid('Invalid tag ID')).min(1, 'At least one tag is required'),
  }),
  params: z.object({ id: z.string().uuid('Invalid company ID') }),
  query: z.object({}).optional(),
});

export const createWorkflowSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Workflow name is required').max(100),
    description: z.string().max(500).optional().or(z.literal('')),
    triggerType: z.enum(workflowTriggers),
    triggerConfig: z.any().optional(),
    conditions: z.any().optional(),
    actions: z.any().optional(),
    isTemplate: z.boolean().optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateWorkflowSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional().or(z.literal('')),
    triggerType: z.enum(workflowTriggers).optional(),
    triggerConfig: z.any().optional(),
    conditions: z.any().optional(),
    actions: z.any().optional(),
    isTemplate: z.boolean().optional(),
  }),
  params: z.object({ id: z.string().uuid('Invalid workflow ID') }),
  query: z.object({}).optional(),
});

export const createRecommendationSchema = z.object({
  body: z.object({
    type: z.enum(recommendationTypes),
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(1000).optional().or(z.literal('')),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    confidence: z.number().min(0).max(100).optional(),
    expiresAt: z.string().datetime().optional().or(z.literal('')),
  }),
  params: z.object({ id: z.string().uuid('Invalid company ID') }),
  query: z.object({}).optional(),
});

export const createFollowupSchema = z.object({
  body: z.object({
    type: z.enum(followupTypes),
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().max(1000).optional().or(z.literal('')),
    ownerId: z.string().uuid('Invalid owner ID').optional().or(z.literal('')),
    dueDate: z.string().datetime({ message: 'Invalid due date format' }),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
  }),
  params: z.object({ id: z.string().uuid('Invalid company ID') }),
  query: z.object({}).optional(),
});

export const updateFollowupSchema = z.object({
  body: z.object({
    type: z.enum(followupTypes).optional(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional().or(z.literal('')),
    ownerId: z.string().uuid('Invalid owner ID').optional().or(z.literal('')),
    dueDate: z.string().datetime().optional(),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
    status: z.enum(['Pending', 'Completed', 'Cancelled', 'Overdue']).optional(),
    notes: z.string().max(2000).optional().or(z.literal('')),
  }),
  params: z.object({ id: z.string().uuid('Invalid company ID'), followupId: z.string().uuid('Invalid followup ID') }),
  query: z.object({}).optional(),
});

export const listQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.string().optional(),
    type: z.string().optional(),
    priority: z.string().optional(),
  }),
  params: z.object({}).optional(),
  body: z.object({}).optional(),
});
