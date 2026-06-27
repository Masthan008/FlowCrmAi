import { BaseRepository } from '../../repositories/base.repository';
import { prisma } from '../../database/db';

export class RevenueRepository extends BaseRepository<any> {
  constructor() {
    super(prisma.companyRevenue);
  }

  async findByCompanyId(companyId: string) {
    return prisma.companyRevenue.findMany({
      where: { companyId, deletedAt: null },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }

  async getSummary(companyId: string) {
    const revenues = await prisma.companyRevenue.findMany({
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

export const revenueRepository = new RevenueRepository();
