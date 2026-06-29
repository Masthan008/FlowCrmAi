"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyIntelligenceRepository = exports.CompanyIntelligenceRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
class CompanyIntelligenceRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.companyLifecycle);
    }
    async getLifecycle(companyId) {
        try {
            return db_1.prisma.companyLifecycle.findUnique({
                where: { companyId },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async upsertLifecycle(companyId, data) {
        try {
            return db_1.prisma.companyLifecycle.upsert({
                where: { companyId },
                create: { companyId, ...data },
                update: data,
            });
        }
        catch (error) {
            throw error;
        }
    }
    async getStageHistory(companyId, page = 1, limit = 20) {
        try {
            const skip = (page - 1) * limit;
            const where = { companyId, deletedAt: null };
            const [items, totalItems] = await Promise.all([
                db_1.prisma.companyStageHistory.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }),
                db_1.prisma.companyStageHistory.count({ where }),
            ]);
            return {
                items,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                page,
                limit,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async addStageHistory(companyId, data) {
        try {
            return db_1.prisma.companyStageHistory.create({
                data: { companyId, ...data },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async getScore(companyId) {
        try {
            return db_1.prisma.companyScore.findUnique({
                where: { companyId },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async upsertScore(companyId, data) {
        try {
            return db_1.prisma.companyScore.upsert({
                where: { companyId },
                create: { companyId, ...data },
                update: data,
            });
        }
        catch (error) {
            throw error;
        }
    }
    async getHealth(companyId) {
        try {
            return db_1.prisma.companyHealth.findUnique({
                where: { companyId },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async upsertHealth(companyId, data) {
        try {
            return db_1.prisma.companyHealth.upsert({
                where: { companyId },
                create: { companyId, ...data },
                update: data,
            });
        }
        catch (error) {
            throw error;
        }
    }
    async getRisk(companyId) {
        try {
            return db_1.prisma.companyRisk.findUnique({
                where: { companyId },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async upsertRisk(companyId, data) {
        try {
            return db_1.prisma.companyRisk.upsert({
                where: { companyId },
                create: { companyId, ...data },
                update: data,
            });
        }
        catch (error) {
            throw error;
        }
    }
    async listSegments(params) {
        try {
            const { page = 1, limit = 20, search, isActive } = params;
            const skip = (page - 1) * limit;
            const where = { deletedAt: null };
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ];
            }
            if (isActive !== undefined)
                where.isActive = isActive;
            const [items, totalItems] = await Promise.all([
                db_1.prisma.companySegment.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: { rules: true, _count: { select: { companyMappings: true } } },
                }),
                db_1.prisma.companySegment.count({ where }),
            ]);
            return {
                items,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                page,
                limit,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async getSegment(id) {
        try {
            return db_1.prisma.companySegment.findFirst({
                where: { id, deletedAt: null },
                include: { rules: true },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async createSegment(data) {
        try {
            const { rules, ...segmentData } = data;
            return db_1.prisma.companySegment.create({
                data: {
                    ...segmentData,
                    rules: rules ? { createMany: { data: rules } } : undefined,
                },
                include: { rules: true },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async updateSegment(id, data) {
        try {
            const { rules, ...segmentData } = data;
            if (rules) {
                await db_1.prisma.companySegmentRule.deleteMany({ where: { segmentId: id } });
            }
            return db_1.prisma.companySegment.update({
                where: { id },
                data: {
                    ...segmentData,
                    rules: rules ? { createMany: { data: rules } } : undefined,
                },
                include: { rules: true },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async deleteSegment(id) {
        try {
            return db_1.prisma.companySegment.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async evaluateSegment(segmentId) {
        try {
            const segment = await db_1.prisma.companySegment.findFirst({
                where: { id: segmentId, deletedAt: null },
                include: { rules: true },
            });
            if (!segment)
                return [];
            const matchType = segment.matchType || 'ALL';
            const companies = await db_1.prisma.company.findMany({
                where: { deletedAt: null },
            });
            const matchingCompanies = companies.filter((company) => {
                if (matchType === 'ALL') {
                    return segment.rules.every((rule) => this.evaluateRule(company, rule));
                }
                return segment.rules.some((rule) => this.evaluateRule(company, rule));
            });
            return matchingCompanies;
        }
        catch (error) {
            throw error;
        }
    }
    evaluateRule(company, rule) {
        const fieldValue = this.getFieldValue(company, rule.field);
        if (fieldValue === undefined || fieldValue === null)
            return false;
        switch (rule.operator) {
            case 'equals':
                return String(fieldValue).toLowerCase() === rule.value.toLowerCase();
            case 'notEquals':
                return String(fieldValue).toLowerCase() !== rule.value.toLowerCase();
            case 'contains':
                return String(fieldValue).toLowerCase().includes(rule.value.toLowerCase());
            case 'greaterThan':
                return Number(fieldValue) > Number(rule.value);
            case 'lessThan':
                return Number(fieldValue) < Number(rule.value);
            case 'in': {
                const values = rule.value.split(',').map((v) => v.trim().toLowerCase());
                return values.includes(String(fieldValue).toLowerCase());
            }
            case 'between': {
                const num = Number(fieldValue);
                return num >= Number(rule.value) && num <= Number(rule.value2 || rule.value);
            }
            default:
                return false;
        }
    }
    getFieldValue(company, field) {
        const fieldMap = {
            industry: 'industry',
            revenue: 'annualRevenue',
            country: 'country',
            lifecycleStage: 'lifecycleStage',
            status: 'status',
            owner: 'ownerId',
            employeeCount: 'employeeCount',
            state: 'state',
            city: 'city',
            companyType: 'companyType',
            priority: 'priority',
            rating: 'rating',
        };
        const mappedField = fieldMap[field] || field;
        return company[mappedField];
    }
    async listTags(params) {
        try {
            const { page = 1, limit = 20, search, isActive } = params;
            const skip = (page - 1) * limit;
            const where = { deletedAt: null };
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ];
            }
            if (isActive !== undefined)
                where.isActive = isActive;
            const [items, totalItems] = await Promise.all([
                db_1.prisma.companyTag.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { name: 'asc' },
                    include: { _count: { select: { mappings: true } } },
                }),
                db_1.prisma.companyTag.count({ where }),
            ]);
            return {
                items,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                page,
                limit,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async createTag(data) {
        try {
            return db_1.prisma.companyTag.create({ data });
        }
        catch (error) {
            throw error;
        }
    }
    async updateTag(id, data) {
        try {
            return db_1.prisma.companyTag.update({
                where: { id },
                data,
            });
        }
        catch (error) {
            throw error;
        }
    }
    async deleteTag(id) {
        try {
            return db_1.prisma.companyTag.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async getCompanyTags(companyId) {
        try {
            return db_1.prisma.companyTagMapping.findMany({
                where: { companyId },
                include: { tag: true },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async assignTagsToCompany(companyId, tagIds, assignedBy) {
        try {
            const existing = await db_1.prisma.companyTagMapping.findMany({
                where: { companyId, tagId: { in: tagIds } },
                select: { tagId: true },
            });
            const existingTagIds = new Set(existing.map((e) => e.tagId));
            const newTagIds = tagIds.filter((id) => !existingTagIds.has(id));
            if (newTagIds.length === 0)
                return [];
            await db_1.prisma.companyTagMapping.createMany({
                data: newTagIds.map((tagId) => ({
                    companyId,
                    tagId,
                    assignedBy: assignedBy || null,
                })),
                skipDuplicates: true,
            });
            return this.getCompanyTags(companyId);
        }
        catch (error) {
            throw error;
        }
    }
    async removeTagFromCompany(companyId, tagId) {
        try {
            return db_1.prisma.companyTagMapping.deleteMany({
                where: { companyId, tagId },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async listWorkflows(params) {
        try {
            const { page = 1, limit = 20, search, triggerType } = params;
            const skip = (page - 1) * limit;
            const where = { deletedAt: null };
            if (search)
                where.name = { contains: search, mode: 'insensitive' };
            if (triggerType)
                where.triggerType = triggerType;
            const [items, totalItems] = await Promise.all([
                db_1.prisma.companyWorkflow.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                }),
                db_1.prisma.companyWorkflow.count({ where }),
            ]);
            return {
                items,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                page,
                limit,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async createWorkflow(data) {
        try {
            return db_1.prisma.companyWorkflow.create({ data });
        }
        catch (error) {
            throw error;
        }
    }
    async updateWorkflow(id, data) {
        try {
            return db_1.prisma.companyWorkflow.update({
                where: { id },
                data,
            });
        }
        catch (error) {
            throw error;
        }
    }
    async deleteWorkflow(id) {
        try {
            return db_1.prisma.companyWorkflow.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async listRecommendations(companyId, params) {
        try {
            const { page = 1, limit = 20, type, priority, isRead, isActioned } = params;
            const skip = (page - 1) * limit;
            const where = { companyId, deletedAt: null };
            if (type)
                where.type = type;
            if (priority)
                where.priority = priority;
            if (isRead !== undefined)
                where.isRead = isRead;
            if (isActioned !== undefined)
                where.isActioned = isActioned;
            const [items, totalItems] = await Promise.all([
                db_1.prisma.companyRecommendation.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
                }),
                db_1.prisma.companyRecommendation.count({ where }),
            ]);
            return {
                items,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                page,
                limit,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async createRecommendation(data) {
        try {
            return db_1.prisma.companyRecommendation.create({ data });
        }
        catch (error) {
            throw error;
        }
    }
    async markRecommendationRead(id) {
        try {
            return db_1.prisma.companyRecommendation.update({
                where: { id },
                data: { isRead: true },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async markRecommendationActioned(id) {
        try {
            return db_1.prisma.companyRecommendation.update({
                where: { id },
                data: { isActioned: true, actionedAt: new Date() },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async listFollowups(companyId, params) {
        try {
            const { page = 1, limit = 20, status, type, priority } = params;
            const skip = (page - 1) * limit;
            const where = { companyId, deletedAt: null };
            if (status)
                where.status = status;
            if (type)
                where.type = type;
            if (priority)
                where.priority = priority;
            const [items, totalItems] = await Promise.all([
                db_1.prisma.companyFollowup.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }],
                    include: { owner: { select: { id: true, firstName: true, lastName: true, email: true } } },
                }),
                db_1.prisma.companyFollowup.count({ where }),
            ]);
            return {
                items,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                page,
                limit,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async createFollowup(data) {
        try {
            return db_1.prisma.companyFollowup.create({
                data,
                include: { owner: { select: { id: true, firstName: true, lastName: true, email: true } } },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async updateFollowup(id, data) {
        try {
            return db_1.prisma.companyFollowup.update({
                where: { id },
                data,
                include: { owner: { select: { id: true, firstName: true, lastName: true, email: true } } },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async deleteFollowup(id) {
        try {
            return db_1.prisma.companyFollowup.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async getInsights() {
        try {
            const baseWhere = { deletedAt: null };
            const [highestRevenue, recentCompanies, mostActive, highestLTV, mostMeetings, mostDeals, mostContacts, highestPipeline, totalCompanies, totalRevenue, avgScore, avgHealth,] = await Promise.all([
                db_1.prisma.company.findFirst({
                    where: baseWhere,
                    orderBy: { annualRevenue: 'desc' },
                    select: { id: true, name: true, annualRevenue: true, industry: true },
                }),
                db_1.prisma.company.findMany({
                    where: baseWhere,
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    select: { id: true, name: true, createdAt: true },
                }),
                db_1.prisma.companyActivity.groupBy({
                    by: ['companyId'],
                    _count: { id: true },
                    orderBy: { _count: { id: 'desc' } },
                    take: 5,
                }),
                db_1.prisma.company.findFirst({
                    where: baseWhere,
                    orderBy: { annualRevenue: 'desc' },
                    select: { id: true, name: true, annualRevenue: true },
                }),
                db_1.prisma.companyActivity.findMany({
                    where: { deletedAt: null, type: 'Meeting' },
                    select: { companyId: true, company: { select: { id: true, name: true } } },
                }),
                null,
                null,
                null,
                db_1.prisma.company.count({ where: baseWhere }),
                db_1.prisma.company.aggregate({ where: baseWhere, _sum: { annualRevenue: true } }),
                db_1.prisma.companyScore.aggregate({ _avg: { overallScore: true } }),
                db_1.prisma.companyHealth.aggregate({ _avg: { overallHealth: true } }),
            ]);
            const meetingCounts = {};
            (mostMeetings || []).forEach((m) => {
                const cid = m.companyId;
                if (!meetingCounts[cid]) {
                    meetingCounts[cid] = { id: cid, name: m.company?.name || 'Unknown', count: 0 };
                }
                meetingCounts[cid].count++;
            });
            const topMeetings = Object.values(meetingCounts).sort((a, b) => b.count - a.count).slice(0, 5);
            return {
                highestRevenueCompany: highestRevenue || null,
                fastestGrowing: recentCompanies || [],
                mostActive: mostActive || [],
                highestLTV: highestLTV || null,
                mostMeetings: topMeetings,
                mostDeals: [],
                mostContacts: [],
                highestPipelineValue: 0,
                totals: {
                    companies: totalCompanies,
                    revenue: totalRevenue._sum?.annualRevenue || 0,
                },
                averages: {
                    score: Math.round(avgScore._avg?.overallScore || 0),
                    health: Math.round(avgHealth._avg?.overallHealth || 0),
                },
            };
        }
        catch (error) {
            throw error;
        }
    }
    async getAnalytics(params) {
        try {
            const { period = 'monthly', year = new Date().getFullYear() } = params;
            const baseWhere = { deletedAt: null };
            const [companyCount, industryDistribution, lifecycleDistribution, statusDistribution, geographicalDistribution, totalRevenue,] = await Promise.all([
                db_1.prisma.company.count({ where: baseWhere }),
                db_1.prisma.company.groupBy({
                    by: ['industry'],
                    _count: { id: true },
                    where: { ...baseWhere, industry: { not: null } },
                    orderBy: { _count: { id: 'desc' } },
                }),
                db_1.prisma.company.groupBy({
                    by: ['lifecycleStage'],
                    _count: { id: true },
                    where: baseWhere,
                    orderBy: { _count: { id: 'desc' } },
                }),
                db_1.prisma.company.groupBy({
                    by: ['status'],
                    _count: { id: true },
                    where: baseWhere,
                    orderBy: { _count: { id: 'desc' } },
                }),
                db_1.prisma.company.groupBy({
                    by: ['country'],
                    _count: { id: true },
                    where: { ...baseWhere, country: { not: null } },
                    orderBy: { _count: { id: 'desc' } },
                    take: 10,
                }),
                db_1.prisma.companyRevenue.aggregate({
                    where: { deletedAt: null, year, type: 'Revenue' },
                    _sum: { amount: true },
                }),
            ]);
            return {
                totalCompanies: companyCount,
                totalRevenue: totalRevenue._sum?.amount || 0,
                period,
                year,
                industryDistribution: industryDistribution.map((i) => ({
                    name: i.industry || 'Unknown',
                    count: i._count.id,
                })),
                lifecycleDistribution: lifecycleDistribution.map((l) => ({
                    stage: l.lifecycleStage,
                    count: l._count.id,
                })),
                customerDistribution: statusDistribution.map((s) => ({
                    status: s.status,
                    count: s._count.id,
                })),
                geographicalDistribution: geographicalDistribution.map((g) => ({
                    country: g.country || 'Unknown',
                    count: g._count.id,
                })),
            };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.CompanyIntelligenceRepository = CompanyIntelligenceRepository;
exports.companyIntelligenceRepository = new CompanyIntelligenceRepository();
