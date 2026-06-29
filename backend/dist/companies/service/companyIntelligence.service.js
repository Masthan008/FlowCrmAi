"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyIntelligenceService = void 0;
const companyIntelligence_repository_1 = require("../repository/companyIntelligence.repository");
const db_1 = require("../../database/db");
exports.companyIntelligenceService = {
    getLifecycle: async (companyId) => {
        const lifecycle = await companyIntelligence_repository_1.companyIntelligenceRepository.getLifecycle(companyId);
        if (!lifecycle)
            throw Object.assign(new Error('Lifecycle not found for this company'), { statusCode: 404 });
        return lifecycle;
    },
    updateLifecycle: async (companyId, data, userId) => {
        const existing = await companyIntelligence_repository_1.companyIntelligenceRepository.getLifecycle(companyId);
        await companyIntelligence_repository_1.companyIntelligenceRepository.addStageHistory(companyId, {
            fromStage: existing?.currentStage || null,
            toStage: data.currentStage,
            changedBy: userId || null,
            changeReason: data.changeReason || null,
            durationInStage: existing ? Math.floor((Date.now() - new Date(existing.enteredStageAt).getTime()) / (1000 * 60 * 60 * 24)) : 0,
        });
        const previousStage = existing?.currentStage || null;
        const transitionCount = (existing?.transitionCount || 0) + 1;
        return companyIntelligence_repository_1.companyIntelligenceRepository.upsertLifecycle(companyId, {
            currentStage: data.currentStage,
            previousStage,
            enteredStageAt: new Date(),
            lastTransition: new Date(),
            transitionCount,
            duration: 0,
        });
    },
    getStageHistory: async (companyId, page, limit) => {
        return companyIntelligence_repository_1.companyIntelligenceRepository.getStageHistory(companyId, page, limit);
    },
    getScore: async (companyId) => {
        const score = await companyIntelligence_repository_1.companyIntelligenceRepository.getScore(companyId);
        if (!score)
            throw Object.assign(new Error('Score not found for this company. Calculate it first.'), { statusCode: 404 });
        return score;
    },
    calculateScore: async (companyId) => {
        const company = await db_1.prisma.company.findFirst({
            where: { id: companyId, deletedAt: null },
            include: {
                revenues: { where: { deletedAt: null } },
                companyActivities: { where: { deletedAt: null } },
                followups: { where: { deletedAt: null } },
                tasks: { where: { companyId } },
            },
        });
        if (!company)
            throw Object.assign(new Error('Company not found'), { statusCode: 404 });
        const totalRevenue = company.revenues?.reduce((sum, r) => sum + r.amount, 0) || 0;
        const revenueScore = Math.min(100, Math.round((totalRevenue / 10000000) * 100));
        const dealValue = company.annualRevenue || 0;
        const dealValueScore = Math.min(100, Math.round((dealValue / 5000000) * 100));
        const activities = company.companyActivities?.length || 0;
        const engagementScore = Math.min(100, Math.round((activities / 20) * 100));
        const meetings = company.companyActivities?.filter((a) => a.type === 'Meeting').length || 0;
        const meetingScore = Math.min(100, Math.round((meetings / 10) * 100));
        const tasks = company.tasks?.length || 0;
        const taskScore = Math.min(100, Math.round((tasks / 15) * 100));
        const followups = company.followups?.length || 0;
        const communicationScore = Math.min(100, Math.round((followups / 10) * 100));
        const lifetimeScore = Math.min(100, Math.round((totalRevenue / 50000000) * 100));
        const overallScore = Math.round((revenueScore * 0.2 +
            dealValueScore * 0.2 +
            engagementScore * 0.15 +
            meetingScore * 0.15 +
            taskScore * 0.1 +
            communicationScore * 0.1 +
            lifetimeScore * 0.1));
        return companyIntelligence_repository_1.companyIntelligenceRepository.upsertScore(companyId, {
            overallScore,
            revenueScore,
            dealValueScore,
            engagementScore,
            meetingScore,
            taskScore,
            communicationScore,
            lifetimeScore,
            lastCalculatedAt: new Date(),
            scoreMetadata: {
                factors: {
                    totalRevenue,
                    dealValue,
                    totalActivities: activities,
                    totalMeetings: meetings,
                    totalTasks: tasks,
                    totalFollowups: followups,
                },
            },
        });
    },
    getHealth: async (companyId) => {
        const health = await companyIntelligence_repository_1.companyIntelligenceRepository.getHealth(companyId);
        if (!health)
            throw Object.assign(new Error('Health not found for this company. Calculate it first.'), { statusCode: 404 });
        return health;
    },
    calculateHealth: async (companyId) => {
        const company = await db_1.prisma.company.findFirst({
            where: { id: companyId, deletedAt: null },
            include: {
                revenues: { where: { deletedAt: null } },
                companyActivities: { where: { deletedAt: null, type: 'Email' } },
                followups: { where: { deletedAt: null } },
                tasks: { where: { companyId } },
            },
        });
        if (!company)
            throw Object.assign(new Error('Company not found'), { statusCode: 404 });
        const totalComm = company.companyActivities?.length || 0;
        const communicationHealth = Math.min(100, Math.round((totalComm / 15) * 100));
        const totalActivities = await db_1.prisma.companyActivity.count({
            where: { companyId, deletedAt: null, status: 'Completed' },
        });
        const dealSuccessHealth = Math.min(100, Math.round((totalActivities / 10) * 100));
        const currentRevenue = company.annualRevenue || 0;
        const revenueGrowthHealth = Math.min(100, Math.round((currentRevenue / 10000000) * 100));
        const meetings = await db_1.prisma.companyActivity.count({
            where: { companyId, deletedAt: null, type: 'Meeting' },
        });
        const meetingHealth = Math.min(100, Math.round((meetings / 8) * 100));
        const satisfactionHealth = 75;
        const supportHealth = 70;
        const totalRevenue = company.revenues?.reduce((sum, r) => sum + r.amount, 0) || 0;
        const paymentHealth = Math.min(100, Math.round((totalRevenue / 5000000) * 100));
        const activityHealth = Math.min(100, Math.round((totalActivities / 20) * 100));
        const overallHealth = Math.round((communicationHealth * 0.15 +
            dealSuccessHealth * 0.15 +
            revenueGrowthHealth * 0.2 +
            meetingHealth * 0.15 +
            satisfactionHealth * 0.1 +
            supportHealth * 0.05 +
            paymentHealth * 0.1 +
            activityHealth * 0.1));
        let healthStatus = 'Good';
        if (overallHealth >= 80)
            healthStatus = 'Excellent';
        else if (overallHealth >= 60)
            healthStatus = 'Good';
        else if (overallHealth >= 40)
            healthStatus = 'Average';
        else if (overallHealth >= 20)
            healthStatus = 'Poor';
        else
            healthStatus = 'Critical';
        return companyIntelligence_repository_1.companyIntelligenceRepository.upsertHealth(companyId, {
            overallHealth,
            healthStatus,
            communicationHealth,
            dealSuccessHealth,
            revenueGrowthHealth,
            meetingHealth,
            satisfactionHealth,
            supportHealth,
            paymentHealth,
            activityHealth,
            lastCalculatedAt: new Date(),
        });
    },
    getRisk: async (companyId) => {
        const risk = await companyIntelligence_repository_1.companyIntelligenceRepository.getRisk(companyId);
        if (!risk)
            throw Object.assign(new Error('Risk not found for this company. Calculate it first.'), { statusCode: 404 });
        return risk;
    },
    calculateRisk: async (companyId) => {
        const company = await db_1.prisma.company.findFirst({
            where: { id: companyId, deletedAt: null },
            include: {
                companyActivities: {
                    where: { deletedAt: null },
                    orderBy: { activityDate: 'desc' },
                    take: 1,
                },
                revenues: { where: { deletedAt: null } },
                followups: { where: { deletedAt: null } },
            },
        });
        if (!company)
            throw Object.assign(new Error('Company not found'), { statusCode: 404 });
        const lastActivity = company.companyActivities?.[0];
        const lastActivityDate = lastActivity?.activityDate || company.createdAt;
        const inactiveDays = Math.floor((Date.now() - new Date(lastActivityDate).getTime()) / (1000 * 60 * 60 * 24));
        const inactiveDaysRisk = Math.min(100, Math.round((inactiveDays / 90) * 100));
        const lostDeals = await db_1.prisma.deal.count({
            where: {
                customer: { companyId },
                stage: { name: { contains: 'Lost', mode: 'insensitive' } },
            },
        });
        const lostDealsRisk = Math.min(100, lostDeals * 20);
        const totalRevenue = company.revenues?.reduce((sum, r) => sum + r.amount, 0) || 0;
        const pendingPaymentsRisk = totalRevenue > 0 ? Math.min(100, Math.round((1 / 3) * 100)) : 50;
        const meetings = await db_1.prisma.companyActivity.count({
            where: { companyId, deletedAt: null, type: 'Meeting' },
        });
        const noMeetingsRisk = meetings === 0 ? 80 : Math.max(0, 100 - meetings * 10);
        const followups = company.followups?.length || 0;
        const lowEngagementRisk = Math.max(0, 100 - (followups * 15));
        const currentRevenue = company.annualRevenue || 0;
        const revenueDeclineRisk = currentRevenue > 0 ? Math.max(0, 50 - Math.round(currentRevenue / 100000)) : 70;
        const expiredContractsRisk = 10;
        const riskReasons = [];
        if (inactiveDays > 30)
            riskReasons.push(`No activity for ${inactiveDays} days`);
        if (lostDeals > 0)
            riskReasons.push(`${lostDeals} lost deal(s)`);
        if (meetings === 0)
            riskReasons.push('No meetings scheduled');
        if (followups === 0)
            riskReasons.push('No follow-ups recorded');
        if (inactiveDays > 60)
            riskReasons.push('High inactivity period');
        const overallRisk = Math.round((inactiveDaysRisk * 0.2 +
            lostDealsRisk * 0.2 +
            pendingPaymentsRisk * 0.15 +
            noMeetingsRisk * 0.15 +
            lowEngagementRisk * 0.1 +
            revenueDeclineRisk * 0.1 +
            expiredContractsRisk * 0.1));
        let riskLevel = 'Low';
        if (overallRisk >= 70)
            riskLevel = 'Critical';
        else if (overallRisk >= 50)
            riskLevel = 'High';
        else if (overallRisk >= 30)
            riskLevel = 'Medium';
        return companyIntelligence_repository_1.companyIntelligenceRepository.upsertRisk(companyId, {
            overallRisk,
            riskLevel,
            inactiveDaysRisk,
            lostDealsRisk,
            pendingPaymentsRisk,
            noMeetingsRisk,
            lowEngagementRisk,
            revenueDeclineRisk,
            expiredContractsRisk,
            riskReasons: JSON.stringify(riskReasons),
            lastCalculatedAt: new Date(),
        });
    },
    transitionLifecycle: async (companyId, newStage, userId, reason) => {
        return exports.companyIntelligenceService.updateLifecycle(companyId, { currentStage: newStage, changeReason: reason }, userId);
    },
    evaluateAndAssignSegments: async (companyId) => {
        const segments = await companyIntelligence_repository_1.companyIntelligenceRepository.listSegments({ isActive: true });
        const company = await db_1.prisma.company.findFirst({
            where: { id: companyId, deletedAt: null },
        });
        if (!company)
            throw Object.assign(new Error('Company not found'), { statusCode: 404 });
        const matchingSegmentIds = [];
        for (const segment of segments.items) {
            if (!segment.isDynamic)
                continue;
            const rules = segment.rules || [];
            if (rules.length === 0)
                continue;
            const matchType = segment.matchType || 'ALL';
            let matches;
            if (matchType === 'ALL') {
                matches = rules.every((rule) => {
                    const repo = companyIntelligence_repository_1.companyIntelligenceRepository;
                    return repo.evaluateRule(company, rule);
                });
            }
            else {
                matches = rules.some((rule) => {
                    const repo = companyIntelligence_repository_1.companyIntelligenceRepository;
                    return repo.evaluateRule(company, rule);
                });
            }
            if (matches) {
                matchingSegmentIds.push(segment.id);
            }
        }
        if (matchingSegmentIds.length > 0) {
            await companyIntelligence_repository_1.companyIntelligenceRepository.assignTagsToCompany(companyId, matchingSegmentIds.map(() => '').filter(() => false), undefined);
            const existing = await db_1.prisma.companySegmentMapping.findMany({
                where: { companyId },
                select: { segmentId: true },
            });
            const existingIds = new Set(existing.map((e) => e.segmentId));
            const newIds = matchingSegmentIds.filter((id) => !existingIds.has(id));
            if (newIds.length > 0) {
                await db_1.prisma.companySegmentMapping.createMany({
                    data: newIds.map((segmentId) => ({
                        companyId,
                        segmentId,
                    })),
                    skipDuplicates: true,
                });
                await Promise.all(newIds.map((segmentId) => db_1.prisma.companySegment.update({
                    where: { id: segmentId },
                    data: { companyCount: { increment: 1 } },
                })));
            }
        }
        return matchingSegmentIds;
    },
    listSegments: async (params) => {
        return companyIntelligence_repository_1.companyIntelligenceRepository.listSegments(params);
    },
    getSegment: async (id) => {
        const segment = await companyIntelligence_repository_1.companyIntelligenceRepository.getSegment(id);
        if (!segment)
            throw Object.assign(new Error('Segment not found'), { statusCode: 404 });
        return segment;
    },
    createSegment: async (data) => {
        return companyIntelligence_repository_1.companyIntelligenceRepository.createSegment(data);
    },
    updateSegment: async (id, data) => {
        const existing = await companyIntelligence_repository_1.companyIntelligenceRepository.getSegment(id);
        if (!existing)
            throw Object.assign(new Error('Segment not found'), { statusCode: 404 });
        return companyIntelligence_repository_1.companyIntelligenceRepository.updateSegment(id, data);
    },
    deleteSegment: async (id) => {
        const existing = await companyIntelligence_repository_1.companyIntelligenceRepository.getSegment(id);
        if (!existing)
            throw Object.assign(new Error('Segment not found'), { statusCode: 404 });
        return companyIntelligence_repository_1.companyIntelligenceRepository.deleteSegment(id);
    },
    evaluateSegment: async (segmentId) => {
        return companyIntelligence_repository_1.companyIntelligenceRepository.evaluateSegment(segmentId);
    },
    listTags: async (params) => {
        return companyIntelligence_repository_1.companyIntelligenceRepository.listTags(params);
    },
    createTag: async (data) => {
        return companyIntelligence_repository_1.companyIntelligenceRepository.createTag(data);
    },
    updateTag: async (id, data) => {
        const existing = await companyIntelligence_repository_1.companyIntelligenceRepository.getSegment(id);
        if (!existing) {
            const tag = await db_1.prisma.companyTag.findFirst({ where: { id, deletedAt: null } });
            if (!tag)
                throw Object.assign(new Error('Tag not found'), { statusCode: 404 });
        }
        return companyIntelligence_repository_1.companyIntelligenceRepository.updateTag(id, data);
    },
    deleteTag: async (id) => {
        const tag = await db_1.prisma.companyTag.findFirst({ where: { id, deletedAt: null } });
        if (!tag)
            throw Object.assign(new Error('Tag not found'), { statusCode: 404 });
        return companyIntelligence_repository_1.companyIntelligenceRepository.deleteTag(id);
    },
    getCompanyTags: async (companyId) => {
        return companyIntelligence_repository_1.companyIntelligenceRepository.getCompanyTags(companyId);
    },
    assignTagsToCompany: async (companyId, tagIds, userId) => {
        return companyIntelligence_repository_1.companyIntelligenceRepository.assignTagsToCompany(companyId, tagIds, userId);
    },
    removeTagFromCompany: async (companyId, tagId) => {
        return companyIntelligence_repository_1.companyIntelligenceRepository.removeTagFromCompany(companyId, tagId);
    },
    listWorkflows: async (params) => {
        return companyIntelligence_repository_1.companyIntelligenceRepository.listWorkflows(params);
    },
    createWorkflow: async (data) => {
        return companyIntelligence_repository_1.companyIntelligenceRepository.createWorkflow(data);
    },
    updateWorkflow: async (id, data) => {
        const existing = await db_1.prisma.companyWorkflow.findFirst({ where: { id, deletedAt: null } });
        if (!existing)
            throw Object.assign(new Error('Workflow not found'), { statusCode: 404 });
        return companyIntelligence_repository_1.companyIntelligenceRepository.updateWorkflow(id, data);
    },
    deleteWorkflow: async (id) => {
        const existing = await db_1.prisma.companyWorkflow.findFirst({ where: { id, deletedAt: null } });
        if (!existing)
            throw Object.assign(new Error('Workflow not found'), { statusCode: 404 });
        return companyIntelligence_repository_1.companyIntelligenceRepository.deleteWorkflow(id);
    },
    listRecommendations: async (companyId, params) => {
        return companyIntelligence_repository_1.companyIntelligenceRepository.listRecommendations(companyId, params);
    },
    createRecommendation: async (data) => {
        return companyIntelligence_repository_1.companyIntelligenceRepository.createRecommendation(data);
    },
    markRecommendationRead: async (id) => {
        const existing = await db_1.prisma.companyRecommendation.findFirst({ where: { id, deletedAt: null } });
        if (!existing)
            throw Object.assign(new Error('Recommendation not found'), { statusCode: 404 });
        return companyIntelligence_repository_1.companyIntelligenceRepository.markRecommendationRead(id);
    },
    markRecommendationActioned: async (id) => {
        const existing = await db_1.prisma.companyRecommendation.findFirst({ where: { id, deletedAt: null } });
        if (!existing)
            throw Object.assign(new Error('Recommendation not found'), { statusCode: 404 });
        return companyIntelligence_repository_1.companyIntelligenceRepository.markRecommendationActioned(id);
    },
    listFollowups: async (companyId, params) => {
        return companyIntelligence_repository_1.companyIntelligenceRepository.listFollowups(companyId, params);
    },
    createFollowup: async (data) => {
        return companyIntelligence_repository_1.companyIntelligenceRepository.createFollowup(data);
    },
    updateFollowup: async (id, data) => {
        const existing = await db_1.prisma.companyFollowup.findFirst({ where: { id, deletedAt: null } });
        if (!existing)
            throw Object.assign(new Error('Follow-up not found'), { statusCode: 404 });
        return companyIntelligence_repository_1.companyIntelligenceRepository.updateFollowup(id, data);
    },
    deleteFollowup: async (id) => {
        const existing = await db_1.prisma.companyFollowup.findFirst({ where: { id, deletedAt: null } });
        if (!existing)
            throw Object.assign(new Error('Follow-up not found'), { statusCode: 404 });
        return companyIntelligence_repository_1.companyIntelligenceRepository.deleteFollowup(id);
    },
    getInsights: async () => {
        return companyIntelligence_repository_1.companyIntelligenceRepository.getInsights();
    },
    getAnalytics: async (params) => {
        return companyIntelligence_repository_1.companyIntelligenceRepository.getAnalytics(params);
    },
};
