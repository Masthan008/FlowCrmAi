"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commissionService = void 0;
const commission_repository_1 = require("../repository/commission.repository");
const db_1 = require("../../database/db");
exports.commissionService = {
    getRules: async (params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = { deletedAt: null };
        if (params.search) {
            where.name = { contains: params.search, mode: 'insensitive' };
        }
        const [items, total] = await Promise.all([
            commission_repository_1.commissionRuleRepository.findMany({ skip, take: limit, where, orderBy: { createdAt: 'desc' } }),
            commission_repository_1.commissionRuleRepository.count(where),
        ]);
        return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
    },
    createRule: async (data, userId) => {
        return commission_repository_1.commissionRuleRepository.create({ ...data, createdBy: userId || null });
    },
    updateRule: async (id, data, userId) => {
        const existing = await commission_repository_1.commissionRuleRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Commission rule not found'), { statusCode: 404 });
        }
        return commission_repository_1.commissionRuleRepository.update(id, { ...data, updatedBy: userId || null });
    },
    deleteRule: async (id, userId) => {
        const existing = await commission_repository_1.commissionRuleRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Commission rule not found'), { statusCode: 404 });
        }
        return commission_repository_1.commissionRuleRepository.softDelete(id, userId);
    },
    getPayouts: async (params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (params.employeeId)
            where.employeeId = params.employeeId;
        if (params.status)
            where.status = params.status;
        if (params.periodStart || params.periodEnd) {
            where.periodStart = {};
            if (params.periodStart)
                where.periodStart.gte = new Date(params.periodStart);
            if (params.periodEnd)
                where.periodStart.lte = new Date(params.periodEnd);
        }
        const [items, total] = await Promise.all([
            commission_repository_1.commissionPayoutRepository.findMany({ skip, take: limit, where, orderBy: { createdAt: 'desc' } }),
            commission_repository_1.commissionPayoutRepository.count(where),
        ]);
        return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
    },
    getPayoutById: async (id) => {
        const payout = await commission_repository_1.commissionPayoutRepository.findById(id);
        if (!payout) {
            throw Object.assign(new Error('Commission payout not found'), { statusCode: 404 });
        }
        return payout;
    },
    calculatePayouts: async (periodStart, periodEnd) => {
        const rules = await db_1.prisma.commissionRule.findMany({
            where: { deletedAt: null, isActive: true },
        });
        const results = [];
        for (const rule of rules) {
            const dealsWhere = {
                deletedAt: null,
                status: 'Won',
                value: { gte: rule.minDealValue },
            };
            if (rule.maxDealValue) {
                dealsWhere.value = { ...dealsWhere.value, lte: rule.maxDealValue };
            }
            if (rule.dealTypes.length > 0) {
                dealsWhere.businessType = { in: rule.dealTypes };
            }
            if (periodStart || periodEnd) {
                dealsWhere.actualCloseDate = {};
                if (periodStart)
                    dealsWhere.actualCloseDate.gte = new Date(periodStart);
                if (periodEnd)
                    dealsWhere.actualCloseDate.lte = new Date(periodEnd);
            }
            const deals = await db_1.prisma.deal.findMany({
                where: dealsWhere,
                select: { id: true, name: true, value: true, assignedToId: true, actualCloseDate: true },
            });
            for (const deal of deals) {
                if (!deal.assignedToId)
                    continue;
                let amount = 0;
                if (rule.type === 'Percentage') {
                    amount = (deal.value || 0) * (rule.rate / 100);
                }
                else if (rule.type === 'Fixed') {
                    amount = rule.rate;
                }
                if (amount > 0) {
                    const payout = await commission_repository_1.commissionPayoutRepository.create({
                        ruleId: rule.id,
                        employeeId: deal.assignedToId,
                        dealId: deal.id,
                        amount,
                        status: 'Pending',
                        periodStart: periodStart ? new Date(periodStart) : null,
                        periodEnd: periodEnd ? new Date(periodEnd) : null,
                    });
                    results.push(payout);
                }
            }
        }
        return { calculated: results.length, payouts: results };
    },
    approvePayout: async (id, userId, notes) => {
        const existing = await commission_repository_1.commissionPayoutRepository.findById(id);
        if (!existing) {
            throw Object.assign(new Error('Commission payout not found'), { statusCode: 404 });
        }
        if (existing.status !== 'Pending') {
            throw Object.assign(new Error('Only pending payouts can be approved'), { statusCode: 400 });
        }
        return commission_repository_1.commissionPayoutRepository.update(id, {
            status: 'Approved',
            notes: notes || null,
            updatedBy: userId || null,
        });
    },
    payPayout: async (id, userId) => {
        const existing = await commission_repository_1.commissionPayoutRepository.findById(id);
        if (!existing) {
            throw Object.assign(new Error('Commission payout not found'), { statusCode: 404 });
        }
        if (existing.status !== 'Approved') {
            throw Object.assign(new Error('Only approved payouts can be marked as paid'), { statusCode: 400 });
        }
        return commission_repository_1.commissionPayoutRepository.update(id, {
            status: 'Paid',
            paidAt: new Date(),
            updatedBy: userId || null,
        });
    },
    getDashboard: async () => {
        const [totalPending, totalApproved, totalPaid, employeeTotals, topEmployees] = await Promise.all([
            db_1.prisma.commissionPayout.aggregate({
                where: { status: 'Pending' },
                _sum: { amount: true },
                _count: true,
            }),
            db_1.prisma.commissionPayout.aggregate({
                where: { status: 'Approved' },
                _sum: { amount: true },
                _count: true,
            }),
            db_1.prisma.commissionPayout.aggregate({
                where: { status: 'Paid' },
                _sum: { amount: true },
                _count: true,
            }),
            db_1.prisma.commissionPayout.groupBy({
                by: ['employeeId'],
                _sum: { amount: true },
                _count: true,
            }),
            db_1.prisma.commissionPayout.findMany({
                where: { status: 'Paid' },
                orderBy: { amount: 'desc' },
                take: 10,
                include: {
                    employee: { select: { id: true, firstName: true, lastName: true, email: true } },
                },
            }),
        ]);
        return {
            totals: {
                pending: { amount: totalPending._sum.amount || 0, count: totalPending._count },
                approved: { amount: totalApproved._sum.amount || 0, count: totalApproved._count },
                paid: { amount: totalPaid._sum.amount || 0, count: totalPaid._count },
            },
            employeeTotals,
            leaderboard: topEmployees,
        };
    },
};
exports.default = exports.commissionService;
