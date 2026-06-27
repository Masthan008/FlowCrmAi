import { revenueRepository } from '../repository/revenue.repository';

export const revenueService = {
  getRevenue: async (companyId: string) => {
    return revenueRepository.findByCompanyId(companyId);
  },

  getRevenueSummary: async (companyId: string) => {
    return revenueRepository.getSummary(companyId);
  },

  createRevenueEntry: async (companyId: string, data: any, userId?: string) => {
    const now = new Date();
    return revenueRepository.create({
      companyId,
      period: data.period || 'Monthly',
      year: data.year || now.getFullYear(),
      month: data.month !== undefined ? data.month : now.getMonth() + 1,
      quarter: data.quarter || null,
      amount: data.amount || 0,
      type: data.type || 'Revenue',
      description: data.description || null,
      createdBy: userId || null,
    });
  },

  deleteRevenueEntry: async (entryId: string, userId?: string) => {
    const existing = await revenueRepository.findById(entryId);
    if (!existing) throw Object.assign(new Error('Revenue entry not found'), { statusCode: 404 });
    await revenueRepository.softDelete(entryId, userId || null);
  },
};
