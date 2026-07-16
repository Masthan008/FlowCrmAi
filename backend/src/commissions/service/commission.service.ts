import { commissionRuleRepository, commissionPayoutRepository } from '../repository/commission.repository';
import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export const commissionService = {
  getRules: async (params: { page?: number; limit?: number; search?: string }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CommissionRuleWhereInput = { deletedAt: null };
    if (params.search) {
      where.name = { contains: params.search, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      commissionRuleRepository.findMany({ skip, take: limit, where, orderBy: { createdAt: 'desc' } }),
      commissionRuleRepository.count(where),
    ]);

    return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  },

  createRule: async (data: {
    name: string;
    description?: string | null;
    type?: string;
    calculation?: string | null;
    rate?: number;
    tierConfig?: any;
    conditions?: any;
    productIds?: string[];
    dealTypes?: string[];
    minDealValue?: number;
    maxDealValue?: number | null;
  }, userId?: string) => {
    return commissionRuleRepository.create({ ...data, createdBy: userId || null });
  },

  updateRule: async (id: string, data: Partial<{
    name: string; description: string | null; type: string; calculation: string | null;
    rate: number; tierConfig: any; conditions: any; productIds: string[];
    dealTypes: string[]; minDealValue: number; maxDealValue: number | null; isActive: boolean;
  }>, userId?: string) => {
    const existing = await commissionRuleRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Commission rule not found'), { statusCode: 404 });
    }
    return commissionRuleRepository.update(id, { ...data, updatedBy: userId || null });
  },

  deleteRule: async (id: string, userId?: string) => {
    const existing = await commissionRuleRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Commission rule not found'), { statusCode: 404 });
    }
    return commissionRuleRepository.softDelete(id, userId);
  },

  getPayouts: async (params: {
    page?: number; limit?: number; employeeId?: string; status?: string;
    periodStart?: string; periodEnd?: string;
  }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CommissionPayoutWhereInput = {};

    if (params.employeeId) where.employeeId = params.employeeId;
    if (params.status) where.status = params.status;
    if (params.periodStart || params.periodEnd) {
      where.periodStart = {};
      if (params.periodStart) where.periodStart.gte = new Date(params.periodStart);
      if (params.periodEnd) where.periodStart.lte = new Date(params.periodEnd);
    }

    const [items, total] = await Promise.all([
      commissionPayoutRepository.findMany({ skip, take: limit, where, orderBy: { createdAt: 'desc' } }),
      commissionPayoutRepository.count(where),
    ]);

    return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  },

  getPayoutById: async (id: string) => {
    const payout = await commissionPayoutRepository.findById(id);
    if (!payout) {
      throw Object.assign(new Error('Commission payout not found'), { statusCode: 404 });
    }
    return payout;
  },

  calculatePayouts: async (periodStart?: string, periodEnd?: string) => {
    const rules = await prisma.commissionRule.findMany({
      where: { deletedAt: null, isActive: true },
    });

    const results: any[] = [];

    for (const rule of rules) {
      const dealsWhere: Prisma.DealWhereInput = {
        deletedAt: null,
        status: 'Won',
        value: { gte: rule.minDealValue },
      };

      if (rule.maxDealValue) {
        dealsWhere.value = { ...dealsWhere.value as any, lte: rule.maxDealValue };
      }

      if (rule.dealTypes.length > 0) {
        dealsWhere.businessType = { in: rule.dealTypes };
      }

      if (periodStart || periodEnd) {
        dealsWhere.actualCloseDate = {};
        if (periodStart) dealsWhere.actualCloseDate.gte = new Date(periodStart);
        if (periodEnd) dealsWhere.actualCloseDate.lte = new Date(periodEnd);
      }

      const deals = await prisma.deal.findMany({
        where: dealsWhere,
        select: { id: true, name: true, value: true, assignedToId: true, actualCloseDate: true },
      });

      for (const deal of deals) {
        if (!deal.assignedToId) continue;

        let amount = 0;
        if (rule.type === 'Percentage') {
          amount = (deal.value || 0) * (rule.rate / 100);
        } else if (rule.type === 'Fixed') {
          amount = rule.rate;
        }

        if (amount > 0) {
          const payout = await commissionPayoutRepository.create({
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

  approvePayout: async (id: string, userId?: string, notes?: string | null) => {
    const existing = await commissionPayoutRepository.findById(id);
    if (!existing) {
      throw Object.assign(new Error('Commission payout not found'), { statusCode: 404 });
    }
    if (existing.status !== 'Pending') {
      throw Object.assign(new Error('Only pending payouts can be approved'), { statusCode: 400 });
    }
    return commissionPayoutRepository.update(id, {
      status: 'Approved',
      notes: notes || null,
      updatedBy: userId || null,
    });
  },

  payPayout: async (id: string, userId?: string) => {
    const existing = await commissionPayoutRepository.findById(id);
    if (!existing) {
      throw Object.assign(new Error('Commission payout not found'), { statusCode: 404 });
    }
    if (existing.status !== 'Approved') {
      throw Object.assign(new Error('Only approved payouts can be marked as paid'), { statusCode: 400 });
    }
    return commissionPayoutRepository.update(id, {
      status: 'Paid',
      paidAt: new Date(),
      updatedBy: userId || null,
    });
  },

  getDashboard: async () => {
    const [totalPending, totalApproved, totalPaid, employeeTotals, topEmployees] = await Promise.all([
      prisma.commissionPayout.aggregate({
        where: { status: 'Pending' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.commissionPayout.aggregate({
        where: { status: 'Approved' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.commissionPayout.aggregate({
        where: { status: 'Paid' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.commissionPayout.groupBy({
        by: ['employeeId'],
        _sum: { amount: true },
        _count: true,
      }),
      prisma.commissionPayout.findMany({
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

export default commissionService;
