"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revenueRepository = exports.RevenueRepository = void 0;
const base_repository_1 = require("../../repositories/base.repository");
const db_1 = require("../../database/db");
class RevenueRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(db_1.prisma.companyRevenue);
    }
    async findByCompanyId(companyId) {
        return db_1.prisma.companyRevenue.findMany({
            where: { companyId, deletedAt: null },
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
        });
    }
    async getSummary(companyId) {
        const revenues = await db_1.prisma.companyRevenue.findMany({
            where: { companyId, deletedAt: null, type: 'Revenue' },
        });
        const annual = revenues.filter(r => r.period === 'Annual');
        const monthly = revenues.filter(r => r.period === 'Monthly');
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
        const annualRevenue = annual.filter(r => r.year === currentYear).reduce((sum, r) => sum + r.amount, 0);
        const monthlyRevenue = monthly.filter(r => r.year === currentYear && r.month === currentMonth).reduce((sum, r) => sum + r.amount, 0);
        const quarterlyRevenue = monthly.filter(r => r.year === currentYear).reduce((sum, r) => sum + r.amount, 0);
        return {
            totalRevenue,
            annualRevenue,
            monthlyRevenue,
            quarterlyRevenue,
            currentYear,
            currentMonth,
            annualCount: annual.length,
            monthlyCount: monthly.length,
        };
    }
}
exports.RevenueRepository = RevenueRepository;
exports.revenueRepository = new RevenueRepository();
