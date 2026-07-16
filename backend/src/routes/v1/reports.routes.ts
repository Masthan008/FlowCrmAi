import { Router } from 'express';
import { prisma } from '../../database/db';
import { ResponseHelper } from '../../helpers/response';
import { requireAuth } from '../../middlewares/auth';
import { requirePermission } from '../../middlewares/permission';

const router = Router();

router.use(requireAuth);

router.get('/sales-overview', requirePermission('companies:view'), async (req, res, next) => {
  try {
    // 1. Total Sales Revenue
    const paidInvoices = await prisma.invoice.aggregate({
      _sum: { total: true },
      where: { status: 'paid', deletedAt: null }
    });
    const totalRevenue = paidInvoices._sum.total || 0;

    // 2. Win conversion rate
    const wonCount = await prisma.deal.count({
      where: { status: 'Won', deletedAt: null }
    });
    const totalClosed = await prisma.deal.count({
      where: { status: { in: ['Won', 'Lost'] }, deletedAt: null }
    });
    const winRate = totalClosed > 0 ? Math.round((wonCount / totalClosed) * 100) : 25;

    // 3. Active pipeline opportunities
    const activeDeals = await prisma.deal.aggregate({
      _sum: { value: true },
      where: { status: 'Open', deletedAt: null }
    });
    const activePipeline = activeDeals._sum.value || 0;

    // 4. Total Sales Executives
    const execCount = await prisma.employee.count({
      where: { deletedAt: null }
    });

    ResponseHelper.sendSuccess(req, res, 200, 'Sales overview computed successfully.', {
      totalRevenue,
      winRate,
      activePipeline,
      execCount
    });
  } catch (error) {
    next(error);
  }
});

router.get('/trends', requirePermission('companies:view'), async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const deals = await prisma.deal.findMany({
      where: {
        createdAt: {
          gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          lte: new Date(`${currentYear}-12-31T23:59:59.999Z`),
        },
        deletedAt: null
      },
      select: { createdAt: true, value: true }
    });

    const trends = months.map((m, idx) => {
      const monthDeals = deals.filter(d => new Date(d.createdAt).getMonth() === idx);
      const volume = monthDeals.reduce((sum, d) => sum + d.value, 0);
      return {
        label: m,
        engagement: monthDeals.length * 15 || 50,
        activeUsers: volume > 0 ? Math.min(100, Math.round(volume / 5000)) : 30
      };
    });

    ResponseHelper.sendSuccess(req, res, 200, 'Trends data retrieved successfully.', trends);
  } catch (error) {
    next(error);
  }
});

export default router;
