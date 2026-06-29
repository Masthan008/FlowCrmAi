"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revenueService = void 0;
const revenue_repository_1 = require("../repository/revenue.repository");
exports.revenueService = {
    getRevenue: async (companyId) => {
        return revenue_repository_1.revenueRepository.findByCompanyId(companyId);
    },
    getRevenueSummary: async (companyId) => {
        return revenue_repository_1.revenueRepository.getSummary(companyId);
    },
    createRevenueEntry: async (companyId, data, userId) => {
        const now = new Date();
        return revenue_repository_1.revenueRepository.create({
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
    deleteRevenueEntry: async (entryId, userId) => {
        const existing = await revenue_repository_1.revenueRepository.findById(entryId);
        if (!existing)
            throw Object.assign(new Error('Revenue entry not found'), { statusCode: 404 });
        await revenue_repository_1.revenueRepository.softDelete(entryId, userId || null);
    },
};
