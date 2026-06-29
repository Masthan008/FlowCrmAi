"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listQuerySchema = exports.updateFollowupSchema = exports.createFollowupSchema = exports.createRecommendationSchema = exports.updateWorkflowSchema = exports.createWorkflowSchema = exports.assignTagsSchema = exports.updateTagSchema = exports.createTagSchema = exports.updateSegmentSchema = exports.createSegmentSchema = exports.getRiskSchema = exports.getHealthSchema = exports.getScoreSchema = exports.updateLifecycleSchema = void 0;
const zod_1 = require("zod");
const lifecycleStages = [
    'Prospect', 'Qualified', 'Customer', 'VIP Customer', 'Partner',
    'Vendor', 'Distributor', 'Inactive', 'Lost Customer', 'Archived',
];
const segmentMatchTypes = ['ALL', 'ANY'];
const workflowTriggers = [
    'company_created', 'status_changed', 'lifecycle_changed', 'owner_changed',
    'revenue_updated', 'deal_closed', 'invoice_generated', 'payment_received', 'branch_added',
];
const recommendationTypes = ['upsell', 'cross_sell', 'renewal_reminder', 'contact_time', 'risk_warning', 'follow_up', 'general'];
const followupTypes = ['Business Review', 'Renewal', 'Contract Discussion', 'Quarterly Meeting', 'Executive Meeting', 'Sales Visit', 'Customer Success Review', 'Escalation'];
exports.updateLifecycleSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentStage: zod_1.z.enum(lifecycleStages),
        changeReason: zod_1.z.string().max(500).optional().or(zod_1.z.literal('')),
    }),
    params: zod_1.z.object({ id: zod_1.z.string().uuid('Invalid company ID') }),
    query: zod_1.z.object({}).optional(),
});
exports.getScoreSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string().uuid('Invalid company ID') }),
    query: zod_1.z.object({}).optional(),
    body: zod_1.z.object({}).optional(),
});
exports.getHealthSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string().uuid('Invalid company ID') }),
    query: zod_1.z.object({}).optional(),
    body: zod_1.z.object({}).optional(),
});
exports.getRiskSchema = zod_1.z.object({
    params: zod_1.z.object({ id: zod_1.z.string().uuid('Invalid company ID') }),
    query: zod_1.z.object({}).optional(),
    body: zod_1.z.object({}).optional(),
});
const segmentRuleSchema = zod_1.z.object({
    field: zod_1.z.string().min(1, 'Field is required'),
    operator: zod_1.z.string().min(1, 'Operator is required'),
    value: zod_1.z.string().min(1, 'Value is required'),
    value2: zod_1.z.string().optional().or(zod_1.z.literal('')),
    logicGroup: zod_1.z.string().optional(),
});
exports.createSegmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Segment name is required').max(100),
        description: zod_1.z.string().max(500).optional().or(zod_1.z.literal('')),
        color: zod_1.z.string().max(20).optional().or(zod_1.z.literal('')),
        icon: zod_1.z.string().max(50).optional().or(zod_1.z.literal('')),
        isDynamic: zod_1.z.boolean().optional(),
        matchType: zod_1.z.enum(segmentMatchTypes).optional(),
        rules: zod_1.z.array(segmentRuleSchema).optional(),
    }),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object({}).optional(),
});
exports.updateSegmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100).optional(),
        description: zod_1.z.string().max(500).optional().or(zod_1.z.literal('')),
        color: zod_1.z.string().max(20).optional().or(zod_1.z.literal('')),
        icon: zod_1.z.string().max(50).optional().or(zod_1.z.literal('')),
        isDynamic: zod_1.z.boolean().optional(),
        matchType: zod_1.z.enum(segmentMatchTypes).optional(),
        rules: zod_1.z.array(segmentRuleSchema).optional(),
    }),
    params: zod_1.z.object({ id: zod_1.z.string().uuid('Invalid segment ID') }),
    query: zod_1.z.object({}).optional(),
});
exports.createTagSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Tag name is required').max(50),
        color: zod_1.z.string().max(20).optional().or(zod_1.z.literal('')),
        description: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
    }),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object({}).optional(),
});
exports.updateTagSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(50).optional(),
        color: zod_1.z.string().max(20).optional().or(zod_1.z.literal('')),
        description: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
    }),
    params: zod_1.z.object({ id: zod_1.z.string().uuid('Invalid tag ID') }),
    query: zod_1.z.object({}).optional(),
});
exports.assignTagsSchema = zod_1.z.object({
    body: zod_1.z.object({
        tagIds: zod_1.z.array(zod_1.z.string().uuid('Invalid tag ID')).min(1, 'At least one tag is required'),
    }),
    params: zod_1.z.object({ id: zod_1.z.string().uuid('Invalid company ID') }),
    query: zod_1.z.object({}).optional(),
});
exports.createWorkflowSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Workflow name is required').max(100),
        description: zod_1.z.string().max(500).optional().or(zod_1.z.literal('')),
        triggerType: zod_1.z.enum(workflowTriggers),
        triggerConfig: zod_1.z.any().optional(),
        conditions: zod_1.z.any().optional(),
        actions: zod_1.z.any().optional(),
        isTemplate: zod_1.z.boolean().optional(),
    }),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object({}).optional(),
});
exports.updateWorkflowSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).max(100).optional(),
        description: zod_1.z.string().max(500).optional().or(zod_1.z.literal('')),
        triggerType: zod_1.z.enum(workflowTriggers).optional(),
        triggerConfig: zod_1.z.any().optional(),
        conditions: zod_1.z.any().optional(),
        actions: zod_1.z.any().optional(),
        isTemplate: zod_1.z.boolean().optional(),
    }),
    params: zod_1.z.object({ id: zod_1.z.string().uuid('Invalid workflow ID') }),
    query: zod_1.z.object({}).optional(),
});
exports.createRecommendationSchema = zod_1.z.object({
    body: zod_1.z.object({
        type: zod_1.z.enum(recommendationTypes),
        title: zod_1.z.string().min(1, 'Title is required').max(200),
        description: zod_1.z.string().max(1000).optional().or(zod_1.z.literal('')),
        priority: zod_1.z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
        confidence: zod_1.z.number().min(0).max(100).optional(),
        expiresAt: zod_1.z.string().datetime().optional().or(zod_1.z.literal('')),
    }),
    params: zod_1.z.object({ id: zod_1.z.string().uuid('Invalid company ID') }),
    query: zod_1.z.object({}).optional(),
});
exports.createFollowupSchema = zod_1.z.object({
    body: zod_1.z.object({
        type: zod_1.z.enum(followupTypes),
        title: zod_1.z.string().min(1, 'Title is required').max(200),
        description: zod_1.z.string().max(1000).optional().or(zod_1.z.literal('')),
        ownerId: zod_1.z.string().uuid('Invalid owner ID').optional().or(zod_1.z.literal('')),
        dueDate: zod_1.z.string().datetime({ message: 'Invalid due date format' }),
        priority: zod_1.z.enum(['Low', 'Medium', 'High']).optional(),
    }),
    params: zod_1.z.object({ id: zod_1.z.string().uuid('Invalid company ID') }),
    query: zod_1.z.object({}).optional(),
});
exports.updateFollowupSchema = zod_1.z.object({
    body: zod_1.z.object({
        type: zod_1.z.enum(followupTypes).optional(),
        title: zod_1.z.string().min(1).max(200).optional(),
        description: zod_1.z.string().max(1000).optional().or(zod_1.z.literal('')),
        ownerId: zod_1.z.string().uuid('Invalid owner ID').optional().or(zod_1.z.literal('')),
        dueDate: zod_1.z.string().datetime().optional(),
        priority: zod_1.z.enum(['Low', 'Medium', 'High']).optional(),
        status: zod_1.z.enum(['Pending', 'Completed', 'Cancelled', 'Overdue']).optional(),
        notes: zod_1.z.string().max(2000).optional().or(zod_1.z.literal('')),
    }),
    params: zod_1.z.object({ id: zod_1.z.string().uuid('Invalid company ID'), followupId: zod_1.z.string().uuid('Invalid followup ID') }),
    query: zod_1.z.object({}).optional(),
});
exports.listQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        type: zod_1.z.string().optional(),
        priority: zod_1.z.string().optional(),
    }),
    params: zod_1.z.object({}).optional(),
    body: zod_1.z.object({}).optional(),
});
