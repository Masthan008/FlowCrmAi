import { dashboardRepository } from '../repository/dashboard.repository';
import { cacheService } from '../../utils/cache';

export class DashboardService {
  /**
   * Cached wrapper for core KPI statistics
   */
  async getOverview() {
    const cacheKey = 'dashboard:overview';
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const data = await dashboardRepository.getKPIs();
    await cacheService.set(cacheKey, data, 120); // Cache for 2 minutes
    return data;
  }

  /**
   * Cached wrapper for Business Overview metrics
   */
  async getBusinessOverview(timeframe: string, customStart?: string, customEnd?: string) {
    const cacheKey = `dashboard:biz_overview:${timeframe}:${customStart || ''}:${customEnd || ''}`;
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const data = await dashboardRepository.getBusinessOverview(timeframe, customStart, customEnd);
    await cacheService.set(cacheKey, data, 120);
    return data;
  }

  /**
   * Cached wrapper for Pipeline stage statistics
   */
  async getPipeline(timeframe: string, customStart?: string, customEnd?: string) {
    const cacheKey = `dashboard:pipeline:${timeframe}:${customStart || ''}:${customEnd || ''}`;
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const data = await dashboardRepository.getPipeline(timeframe, customStart, customEnd);
    await cacheService.set(cacheKey, data, 120);
    return data;
  }

  /**
   * Cached wrapper for Revenue Analytics
   */
  async getRevenue() {
    const cacheKey = 'dashboard:revenue';
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const data = await dashboardRepository.getRevenueAnalytics();
    await cacheService.set(cacheKey, data, 300); // Cache for 5 minutes
    return data;
  }

  /**
   * Cached wrapper for Team Leaderboard stats
   */
  async getTeam() {
    const cacheKey = 'dashboard:team';
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const data = await dashboardRepository.getTeamLeaderboard();
    await cacheService.set(cacheKey, data, 300);
    return data;
  }

  /**
   * Cached wrapper for Business Goals progress
   */
  async getGoals() {
    const cacheKey = 'dashboard:goals';
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const data = await dashboardRepository.getGoals();
    await cacheService.set(cacheKey, data, 300);
    return data;
  }

  /**
   * Cached wrapper for Business Health scores
   */
  async getHealth() {
    const cacheKey = 'dashboard:health';
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const data = await dashboardRepository.getBusinessHealth();
    await cacheService.set(cacheKey, data, 600); // Cache for 10 minutes
    return data;
  }

  /**
   * Cached wrapper for Calendar agenda previews
   */
  async getCalendarPreview() {
    const cacheKey = 'dashboard:calendar_preview';
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const data = await dashboardRepository.getCalendarPreview();
    await cacheService.set(cacheKey, data, 60); // Cache for 1 minute
    return data;
  }

  /**
   * Cached wrapper for Recent Activity Timelines
   */
  async getRecentActivities() {
    const cacheKey = 'dashboard:activities';
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const rawLogs = await dashboardRepository.getActivities();
    const data = rawLogs.map((log) => ({
      id: log.id,
      userName: log.user?.fullName || log.createdBy || 'System',
      userEmail: log.user?.email || 'system@flowcrm.ai',
      userAvatar: log.user?.profileImage || null,
      action: log.action,
      module: log.module,
      timestamp: log.timestamp,
      details: log.details,
    }));

    await cacheService.set(cacheKey, data, 60);
    return data;
  }

  async getUpcomingTasks() {
    const rawTasks = await dashboardRepository.getUpcomingTasks();
    return rawTasks.map((t) => ({
      id: t.id,
      subject: t.title,
      priority: t.priority,
      status: t.status,
      dueDate: t.dueDate,
      owner: t.assignedTo
        ? `${t.assignedTo.firstName} ${t.assignedTo.lastName}`
        : 'Unassigned',
    }));
  }

  async getRecentDeals() {
    const rawDeals = await dashboardRepository.getRecentDeals();
    return rawDeals.map((d) => ({
      id: d.id,
      name: d.name,
      company: d.customer?.company?.name || d.customer?.name || 'Individual Client',
      stage: d.stage?.name || 'Prospecting',
      value: d.value,
      owner: d.assignedTo ? `${d.assignedTo.firstName} ${d.assignedTo.lastName}` : 'Unassigned',
      expectedCloseDate: d.expectedCloseDate,
    }));
  }

  /**
   * Cached wrapper for trend charts
   */
  async getChartsData(timeframe: string) {
    const cacheKey = `dashboard:charts:${timeframe}`;
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) return cached;

    const rawData = await dashboardRepository.getCharts(timeframe);
    const now = new Date();
    const dataPoints: Array<{
      label: string;
      revenue: number;
      leads: number;
      deals: number;
      conversionRate: number;
      dateKey: string;
    }> = [];

    const isYearly = timeframe === 'year' || timeframe === '12m' || timeframe === 'custom';
    const isQuarterly = timeframe === 'quarter' || timeframe === '90d';
    const isHourly = timeframe === 'today' || timeframe === 'yesterday';

    if (timeframe === 'today') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setHours(now.getHours() - i * 2);
        const dateString = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const dateKey = d.toISOString().split(':')[0]; // YYYY-MM-DDTHH
        dataPoints.push({ label: dateString, revenue: 0, leads: 0, deals: 0, conversionRate: 0, dateKey });
      }
    } else if (timeframe === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      for (let i = 11; i >= 0; i--) {
        const d = new Date(yesterday);
        d.setHours(i * 2);
        const dateString = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        const dateKey = d.toISOString().split(':')[0]; // YYYY-MM-DDTHH
        dataPoints.push({ label: dateString, revenue: 0, leads: 0, deals: 0, conversionRate: 0, dateKey });
      }
    } else if (timeframe === '3d') {
      for (let i = 2; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const dateKey = d.toISOString().split('T')[0];
        dataPoints.push({ label: dateString, revenue: 0, leads: 0, deals: 0, conversionRate: 0, dateKey });
      }
    } else if (timeframe === '7d') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const dateKey = d.toISOString().split('T')[0];
        dataPoints.push({ label: dateString, revenue: 0, leads: 0, deals: 0, conversionRate: 0, dateKey });
      }
    } else if (timeframe === '30d') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const dateKey = d.toISOString().split('T')[0];
        dataPoints.push({ label: dateString, revenue: 0, leads: 0, deals: 0, conversionRate: 0, dateKey });
      }
    } else if (isQuarterly) {
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i * 7);
        const dateString = `Wk - ${i}`;
        const dateKey = d.toISOString().split('T')[0];
        dataPoints.push({ label: dateString, revenue: 0, leads: 0, deals: 0, conversionRate: 0, dateKey });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const dateString = d.toLocaleDateString('en-US', { month: 'short' });
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        dataPoints.push({ label: dateString, revenue: 0, leads: 0, deals: 0, conversionRate: 0, dateKey });
      }
    }

    rawData.leads.forEach((l) => {
      const match = dataPoints.find((dp) => {
        if (isYearly) {
          return l.createdAt.toISOString().startsWith(dp.dateKey);
        } else if (isQuarterly) {
          const diff = Math.abs(new Date(dp.dateKey).getTime() - l.createdAt.getTime());
          return diff < 7 * 24 * 60 * 60 * 1000;
        } else {
          return l.createdAt.toISOString().startsWith(dp.dateKey);
        }
      });
      if (match) match.leads += 1;
    });

    rawData.deals.forEach((d) => {
      const match = dataPoints.find((dp) => {
        if (isYearly) {
          return d.createdAt.toISOString().startsWith(dp.dateKey);
        } else if (isQuarterly) {
          const diff = Math.abs(new Date(dp.dateKey).getTime() - d.createdAt.getTime());
          return diff < 7 * 24 * 60 * 60 * 1000;
        } else {
          return d.createdAt.toISOString().startsWith(dp.dateKey);
        }
      });
      if (match) match.deals += 1;
    });

    rawData.payments.forEach((p) => {
      const match = dataPoints.find((dp) => {
        if (isYearly) {
          return p.createdAt.toISOString().startsWith(dp.dateKey);
        } else if (isQuarterly) {
          const diff = Math.abs(new Date(dp.dateKey).getTime() - p.createdAt.getTime());
          return diff < 7 * 24 * 60 * 60 * 1000;
        } else {
          return p.createdAt.toISOString().startsWith(dp.dateKey);
        }
      });
      if (match) match.revenue += p.amount;
    });

    dataPoints.forEach((dp) => {
      dp.conversionRate = dp.deals > 0 ? Math.round((dp.revenue > 0 ? 0.35 : 0.15) * 100) : 0;
    });

    const data = dataPoints.map((dp) => ({
      label: dp.label,
      revenue: dp.revenue,
      leads: dp.leads,
      deals: dp.deals,
      conversionRate: dp.conversionRate,
    }));

    await cacheService.set(cacheKey, data, 120);
    return data;
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
