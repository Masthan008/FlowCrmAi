"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealAutomationRepository = void 0;
const db_1 = require("../../database/db");
exports.dealAutomationRepository = {
    // DEAL LIFECYCLE
    findLifecycleByDealId: async (dealId) => {
        let lifecycle = await db_1.prisma.dealLifecycle.findUnique({
            where: { dealId }
        });
        if (!lifecycle) {
            lifecycle = await db_1.prisma.dealLifecycle.create({
                data: {
                    dealId,
                    currentStage: 'Discovery',
                    recommendedNextStage: 'Needs Analysis',
                    previousStage: 'Qualified',
                    durationInStage: 3600 * 24 * 3 // 3 days in seconds
                }
            });
        }
        return lifecycle;
    },
    updateLifecycle: async (dealId, data) => {
        return db_1.prisma.dealLifecycle.upsert({
            where: { dealId },
            update: data,
            create: { dealId, ...data }
        });
    },
    // DEAL SCORING
    findScoreByDealId: async (dealId) => {
        let score = await db_1.prisma.dealScore.findUnique({
            where: { dealId }
        });
        if (!score) {
            score = await db_1.prisma.dealScore.create({
                data: {
                    dealId,
                    score: 72,
                    category: 'Strong',
                    companyScore: 80,
                    contactEngagement: 65,
                    meetingCount: 3,
                    activityCount: 8,
                    taskCompletion: 70,
                    dealValue: 45000.0,
                    pipelineStage: 'Discovery',
                    quoteStatus: 'draft',
                    decisionMakerAvail: true,
                    relationshipStrength: 'High'
                }
            });
        }
        return score;
    },
    updateScore: async (dealId, data) => {
        return db_1.prisma.dealScore.upsert({
            where: { dealId },
            update: data,
            create: { dealId, ...data }
        });
    },
    // WIN PROBABILITY
    findWinProbabilityByDealId: async (dealId) => {
        let prob = await db_1.prisma.dealWinProbability.findUnique({
            where: { dealId }
        });
        if (!prob) {
            prob = await db_1.prisma.dealWinProbability.create({
                data: {
                    dealId,
                    probability: 65,
                    confidenceLevel: 'Medium',
                    reasoningSummary: 'Decision maker has confirmed requirements and budget fits our pricing sheet. Awaiting quote confirmation.'
                }
            });
        }
        return prob;
    },
    updateWinProbability: async (dealId, data) => {
        return db_1.prisma.dealWinProbability.upsert({
            where: { dealId },
            update: data,
            create: { dealId, ...data }
        });
    },
    // DEAL HEALTH
    findHealthByDealId: async (dealId) => {
        let health = await db_1.prisma.dealHealth.findUnique({
            where: { dealId }
        });
        if (!health) {
            health = await db_1.prisma.dealHealth.create({
                data: {
                    dealId,
                    overallHealth: 'Good',
                    communicationScore: 80,
                    activityScore: 70,
                    meetingsScore: 85,
                    revenueScore: 90,
                    tasksScore: 60,
                    approvalsScore: 50,
                    timelineProgress: 45,
                    pipelineMovement: 75
                }
            });
        }
        return health;
    },
    updateHealth: async (dealId, data) => {
        return db_1.prisma.dealHealth.upsert({
            where: { dealId },
            update: data,
            create: { dealId, ...data }
        });
    },
    // DEAL RISK
    findRisksByDealId: async (dealId) => {
        const risks = await db_1.prisma.dealRisk.findMany({
            where: { dealId }
        });
        if (risks.length === 0) {
            const seedRisk = await db_1.prisma.dealRisk.create({
                data: {
                    dealId,
                    riskLevel: 'Medium',
                    reasons: ['No communication logged in the last 7 days', 'Missing explicit contract review sign-off'],
                    recommendedAction: 'Schedule an immediate follow-up status call and invite the primary technical consultant.'
                }
            });
            return [seedRisk];
        }
        return risks;
    },
    createRisk: async (data) => {
        return db_1.prisma.dealRisk.create({ data });
    },
    // SMART RECOMMENDATIONS
    findRecommendationsByDealId: async (dealId) => {
        const items = await db_1.prisma.dealRecommendation.findMany({
            where: { dealId, isCompleted: false }
        });
        if (items.length === 0) {
            await db_1.prisma.dealRecommendation.createMany({
                data: [
                    { dealId, recommendation: 'Schedule Follow-up', reason: 'Keep customer engaged after discovery phase.' },
                    { dealId, recommendation: 'Request Approval', reason: 'Quote discount exceeds 5% default delegation limit.' },
                    { dealId, recommendation: 'Contact Decision Maker', reason: 'Ensure technical stakeholders approve custom terms.' }
                ]
            });
            return db_1.prisma.dealRecommendation.findMany({ where: { dealId, isCompleted: false } });
        }
        return items;
    },
    updateRecommendation: async (id, isCompleted) => {
        return db_1.prisma.dealRecommendation.update({
            where: { id },
            data: { isCompleted }
        });
    },
    // SLA MANAGEMENT
    findSLAByDealId: async (dealId) => {
        let sla = await db_1.prisma.dealSLA.findUnique({
            where: { dealId }
        });
        if (!sla) {
            sla = await db_1.prisma.dealSLA.create({
                data: {
                    dealId,
                    firstResponseStatus: 'Green',
                    firstResponseTime: new Date(Date.now() - 3600000 * 2),
                    proposalResponseStatus: 'Yellow',
                    proposalResponseTime: new Date(Date.now() + 3600000 * 24),
                    followUpStatus: 'Green',
                    followUpTime: new Date(Date.now() + 3600000 * 48),
                    negotiationStatus: 'Green',
                    negotiationTime: new Date(Date.now() + 3600000 * 72),
                    approvalStatus: 'Green',
                    approvalTime: new Date(Date.now() + 3600000 * 12),
                    expectedCloseDate: new Date(Date.now() + 3600000 * 24 * 30),
                    escalationTime: new Date(Date.now() + 3600000 * 24 * 10)
                }
            });
        }
        return sla;
    },
    updateSLA: async (dealId, data) => {
        return db_1.prisma.dealSLA.upsert({
            where: { dealId },
            update: data,
            create: { dealId, ...data }
        });
    },
    // PLAYBOOKS
    findPlaybooksByDealId: async (dealId) => {
        const playbooks = await db_1.prisma.dealPlaybook.findMany({
            where: { dealId }
        });
        if (playbooks.length === 0) {
            const seedPlaybook = await db_1.prisma.dealPlaybook.create({
                data: {
                    dealId,
                    name: 'Enterprise Sales Playbook',
                    checklist: [
                        { id: '1', task: 'Confirm executive sponsor', done: true },
                        { id: '2', task: 'Log competitor details', done: false },
                        { id: '3', task: 'Submit technical proposal', done: false }
                    ],
                    recommendedActivities: [
                        { activity: 'Schedule technical discovery demo session', days: 5 },
                        { activity: 'Conduct legal compliance validation review', days: 15 }
                    ],
                    documentsRequired: ['NDA Sign-off', 'Pricing proposal sheet', 'Technical SLA document'],
                    milestones: ['Discovery Completed', 'Demo Sign-off', 'Contract Negotiation Started']
                }
            });
            return [seedPlaybook];
        }
        return playbooks;
    },
    createPlaybook: async (data) => {
        return db_1.prisma.dealPlaybook.create({ data });
    },
    // FOLLOW-UPS
    findFollowupsByDealId: async (dealId) => {
        const list = await db_1.prisma.dealFollowup.findMany({
            where: { dealId, deletedAt: null },
            orderBy: { scheduledDate: 'asc' }
        });
        if (list.length === 0) {
            await db_1.prisma.dealFollowup.createMany({
                data: [
                    {
                        dealId,
                        channel: 'Phone Call',
                        scheduledDate: new Date(Date.now() + 3600000 * 24),
                        priority: 'High',
                        reminderAlert: true,
                        status: 'Scheduled',
                        notes: 'Follow up regarding pricing quote approval.',
                        createdBy: 'system'
                    },
                    {
                        dealId,
                        channel: 'Email Placeholder',
                        scheduledDate: new Date(Date.now() + 3600000 * 48),
                        priority: 'Medium',
                        reminderAlert: false,
                        status: 'Scheduled',
                        notes: 'Share case study files and SLA sheets.',
                        createdBy: 'system'
                    }
                ]
            });
            return db_1.prisma.dealFollowup.findMany({ where: { dealId, deletedAt: null } });
        }
        return list;
    },
    createFollowup: async (data) => {
        return db_1.prisma.dealFollowup.create({ data });
    },
    // WORKFLOW ENGINE
    findWorkflows: async (module) => {
        const list = await db_1.prisma.cRMWorkflow.findMany({
            where: {
                deletedAt: null,
                ...(module && { module })
            },
            orderBy: { createdAt: 'desc' }
        });
        // Seed generic default CRM workflows if none exist
        if (list.length === 0) {
            await db_1.prisma.cRMWorkflow.createMany({
                data: [
                    {
                        name: 'Auto-escalate High-Value Enterprise Deals',
                        module: 'Deal',
                        trigger: 'Deal Created',
                        conditions: { revenue: { gte: 50000 } },
                        actions: [
                            { type: 'Add Tag', value: 'High Value' },
                            { type: 'Create Task', title: 'Schedule Discovery Call within 24 Hours' }
                        ],
                        isActive: true,
                        createdBy: 'system'
                    },
                    {
                        name: 'Automate Owner Task on Stage Change',
                        module: 'Deal',
                        trigger: 'Stage Changed',
                        conditions: { stage: 'Proposal' },
                        actions: [
                            { type: 'Create Task', title: 'Compile Custom Pricing Sheet Proposal' }
                        ],
                        isActive: true,
                        createdBy: 'system'
                    }
                ]
            });
            return db_1.prisma.cRMWorkflow.findMany({ where: { deletedAt: null } });
        }
        return list;
    },
    createWorkflow: async (data) => {
        return db_1.prisma.cRMWorkflow.create({ data });
    },
    createWorkflowLog: async (data) => {
        return db_1.prisma.cRMWorkflowLog.create({ data });
    },
    findWorkflowLogs: async (workflowId) => {
        return db_1.prisma.cRMWorkflowLog.findMany({
            where: {
                ...(workflowId && { workflowId })
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
    }
};
