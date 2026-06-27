import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../service/dashboard.service';
import { ResponseHelper } from '../../helpers/response';

export const dashboardController = {
  /**
   * GET /dashboard/overview
   */
  getOverview: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dashboardService.getOverview();
      ResponseHelper.sendSuccess(req, res, 200, 'Dashboard overview statistics loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /dashboard/charts
   */
  getCharts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const timeframe = (req.query.timeframe as string) || '12m';
      const data = await dashboardService.getChartsData(timeframe);
      ResponseHelper.sendSuccess(req, res, 200, `Dashboard trend chart data loaded for: ${timeframe}`, data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /dashboard/activities
   */
  getActivities: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dashboardService.getRecentActivities();
      ResponseHelper.sendSuccess(req, res, 200, 'Recent database activity logs loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /dashboard/tasks
   */
  getTasks: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dashboardService.getUpcomingTasks();
      ResponseHelper.sendSuccess(req, res, 200, 'Upcoming task list items loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /dashboard/deals
   */
  getDeals: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dashboardService.getRecentDeals();
      ResponseHelper.sendSuccess(req, res, 200, 'Recent active deal pipelines loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /dashboard/business-overview
   */
  getBusinessOverview: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const timeframe = (req.query.timeframe as string) || '30d';
      const customStart = req.query.startDate as string;
      const customEnd = req.query.endDate as string;
      const data = await dashboardService.getBusinessOverview(timeframe, customStart, customEnd);
      ResponseHelper.sendSuccess(req, res, 200, 'Business overview aggregates loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /dashboard/pipeline
   */
  getPipeline: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const timeframe = (req.query.timeframe as string) || '30d';
      const customStart = req.query.startDate as string;
      const customEnd = req.query.endDate as string;
      const data = await dashboardService.getPipeline(timeframe, customStart, customEnd);
      ResponseHelper.sendSuccess(req, res, 200, 'Sales pipeline stages overview loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /dashboard/revenue
   */
  getRevenue: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dashboardService.getRevenue();
      ResponseHelper.sendSuccess(req, res, 200, 'Revenue analytics calculations loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /dashboard/team
   */
  getTeam: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dashboardService.getTeam();
      ResponseHelper.sendSuccess(req, res, 200, 'Team leaderboard statistics loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /dashboard/goals
   */
  getGoals: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dashboardService.getGoals();
      ResponseHelper.sendSuccess(req, res, 200, 'Corporate target target-sales loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /dashboard/health
   */
  getHealth: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dashboardService.getHealth();
      ResponseHelper.sendSuccess(req, res, 200, 'Business health index compliance metrics loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /dashboard/calendar-preview
   */
  getCalendarPreview: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dashboardService.getCalendarPreview();
      ResponseHelper.sendSuccess(req, res, 200, 'Calendar schedule preview loads successfully.', data);
    } catch (error) {
      next(error);
    }
  }
};

export default dashboardController;
