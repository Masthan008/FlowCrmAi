"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealRepository = exports.DealRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
const dealInclude = {
    company: { select: { id: true, name: true } },
    customer: { select: { id: true, name: true, email: true } },
    primaryContact: { select: { id: true, firstName: true, lastName: true, email: true } },
    lead: { select: { id: true, leadNumber: true, fullName: true } },
    stage: { select: { id: true, name: true, order: true, probability: true } },
    pipeline: { select: { id: true, name: true } },
    assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
};
class DealRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.deal);
    }
    async getNextDealNumber() {
        const lastDeal = await db_1.prisma.deal.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { dealNumber: true },
        });
        let nextNum = 1;
        if (lastDeal?.dealNumber) {
            const parts = lastDeal.dealNumber.split('-');
            const num = parseInt(parts[1], 10);
            if (!isNaN(num))
                nextNum = num + 1;
        }
        return `DL-${String(nextNum).padStart(5, '0')}`;
    }
    async findByIdWithRelations(id) {
        return db_1.prisma.deal.findFirst({
            where: { id, deletedAt: null },
            include: dealInclude,
        });
    }
    async paginateWithRelations(params) {
        const { page = 1, limit = 20, search, status, pipelineId, stageId, assignedToId, priority, source, industry, companyId, valueMin, valueMax, probabilityMin, probabilityMax, closeDateFrom, closeDateTo, createdFrom, createdTo, myDeals, open, won, lost, closingThisMonth, highProbability, highValue, recentlyCreated, sortBy = 'createdAt', sortDir = 'desc', currentUserId, } = params;
        const skip = (page - 1) * limit;
        const where = { deletedAt: null };
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { opportunityName: { contains: search, mode: 'insensitive' } },
                { dealNumber: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { tags: { has: search } },
                { company: { name: { contains: search, mode: 'insensitive' } } },
                { primaryContact: { firstName: { contains: search, mode: 'insensitive' } } },
                { primaryContact: { lastName: { contains: search, mode: 'insensitive' } } },
                { lead: { fullName: { contains: search, mode: 'insensitive' } } },
            ];
        }
        if (status)
            where.status = status;
        if (pipelineId)
            where.pipelineId = pipelineId;
        if (stageId)
            where.stageId = stageId;
        if (assignedToId)
            where.assignedToId = assignedToId;
        if (priority)
            where.priority = priority;
        if (source)
            where.source = source;
        if (industry)
            where.industry = industry;
        if (companyId)
            where.companyId = companyId;
        if (valueMin !== undefined || valueMax !== undefined) {
            where.value = {};
            if (valueMin !== undefined)
                where.value.gte = valueMin;
            if (valueMax !== undefined)
                where.value.lte = valueMax;
        }
        if (probabilityMin !== undefined || probabilityMax !== undefined) {
            where.probability = {};
            if (probabilityMin !== undefined)
                where.probability.gte = probabilityMin;
            if (probabilityMax !== undefined)
                where.probability.lte = probabilityMax;
        }
        if (closeDateFrom || closeDateTo) {
            where.expectedCloseDate = {};
            if (closeDateFrom)
                where.expectedCloseDate.gte = new Date(closeDateFrom);
            if (closeDateTo)
                where.expectedCloseDate.lte = new Date(closeDateTo);
        }
        if (createdFrom || createdTo) {
            where.createdAt = {};
            if (createdFrom)
                where.createdAt.gte = new Date(createdFrom);
            if (createdTo)
                where.createdAt.lte = new Date(createdTo);
        }
        if (myDeals && currentUserId) {
            where.assignedToId = currentUserId;
        }
        if (open) {
            where.status = { in: ['Open', 'Qualified', 'Proposal Sent', 'Negotiation'] };
        }
        if (won) {
            where.status = 'Won';
        }
        if (lost) {
            where.status = { in: ['Lost', 'Cancelled'] };
        }
        if (closingThisMonth) {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
            where.expectedCloseDate = {
                gte: startOfMonth,
                lte: endOfMonth,
            };
        }
        if (highProbability) {
            where.probability = { gte: 70 };
        }
        if (highValue) {
            where.value = { gte: 100000 };
        }
        if (recentlyCreated) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            where.createdAt = { gte: thirtyDaysAgo };
        }
        const orderBy = {};
        const allowedSortFields = [
            'dealNumber', 'name', 'opportunityName', 'status', 'priority',
            'probability', 'value', 'expectedRevenue', 'expectedCloseDate',
            'actualCloseDate', 'createdAt', 'updatedAt', 'currency', 'source', 'industry',
        ];
        if (allowedSortFields.includes(sortBy)) {
            orderBy[sortBy] = sortDir === 'asc' ? 'asc' : 'desc';
        }
        else {
            orderBy.createdAt = 'desc';
        }
        const [items, totalItems] = await Promise.all([
            db_1.prisma.deal.findMany({
                where,
                include: dealInclude,
                skip,
                take: limit,
                orderBy,
            }),
            db_1.prisma.deal.count({ where }),
        ]);
        return {
            items,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            page,
            limit,
        };
    }
    async updateStatus(ids, status, updatedBy) {
        return db_1.prisma.deal.updateMany({
            where: { id: { in: ids } },
            data: { status, updatedBy },
        });
    }
    async updateStage(id, stageId, updatedBy) {
        const stage = await db_1.prisma.pipelineStage.findUnique({
            where: { id: stageId },
            select: { probability: true },
        });
        const probability = stage?.probability ?? 0;
        return db_1.prisma.deal.update({
            where: { id },
            data: { stageId, probability, updatedBy },
            include: dealInclude,
        });
    }
    async updateOwner(ids, ownerId, updatedBy) {
        return db_1.prisma.deal.updateMany({
            where: { id: { in: ids } },
            data: { assignedToId: ownerId, updatedBy },
        });
    }
    async getStatistics(currentUserId) {
        const baseWhere = { deletedAt: null };
        if (currentUserId) {
            baseWhere.assignedToId = currentUserId;
        }
        const [total, openDeals, wonDeals, lostDeals, pipelineValue, wonRevenue, avgAgg,] = await Promise.all([
            db_1.prisma.deal.count({ where: baseWhere }),
            db_1.prisma.deal.count({
                where: { ...baseWhere, status: { in: ['Open', 'Qualified', 'Proposal Sent', 'Negotiation'] } },
            }),
            db_1.prisma.deal.count({ where: { ...baseWhere, status: 'Won' } }),
            db_1.prisma.deal.count({
                where: { ...baseWhere, status: { in: ['Lost', 'Cancelled'] } },
            }),
            db_1.prisma.deal.aggregate({
                where: { ...baseWhere, status: { notIn: ['Lost', 'Cancelled', 'Archived'] } },
                _sum: { value: true },
            }),
            db_1.prisma.deal.aggregate({
                where: { ...baseWhere, status: 'Won' },
                _sum: { expectedRevenue: true },
            }),
            db_1.prisma.deal.aggregate({
                where: { ...baseWhere, status: { notIn: ['Lost', 'Cancelled', 'Archived'] } },
                _avg: { value: true, probability: true },
            }),
        ]);
        return {
            total,
            openDeals,
            wonDeals,
            lostDeals,
            pipelineValue: pipelineValue._sum.value || 0,
            wonRevenue: wonRevenue._sum.expectedRevenue || 0,
            averageDealValue: avgAgg._avg.value || 0,
            averageProbability: avgAgg._avg.probability || 0,
        };
    }
}
exports.DealRepository = DealRepository;
exports.dealRepository = new DealRepository();
exports.default = exports.dealRepository;
