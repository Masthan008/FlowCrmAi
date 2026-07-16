import { Request, Response, NextFunction } from 'express';
import { commissionService } from '../service/commission.service';
import { ResponseHelper } from '../../helpers/response';

export const commissionController = {
  listRules: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string;

      const result = await commissionService.getRules({ page, limit, search });
      ResponseHelper.sendSuccess(req, res, 200, 'Commission rules retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  createRule: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rule = await commissionService.createRule(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Commission rule created successfully.', rule);
    } catch (error) { next(error); }
  },

  updateRule: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rule = await commissionService.updateRule(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Commission rule updated successfully.', rule);
    } catch (error) { next(error); }
  },

  deleteRule: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await commissionService.deleteRule(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Commission rule deleted successfully.');
    } catch (error) { next(error); }
  },

  listPayouts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const employeeId = req.query.employeeId as string;
      const status = req.query.status as string;
      const periodStart = req.query.periodStart as string;
      const periodEnd = req.query.periodEnd as string;

      const result = await commissionService.getPayouts({ page, limit, employeeId, status, periodStart, periodEnd });
      ResponseHelper.sendSuccess(req, res, 200, 'Commission payouts retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  getPayoutById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payout = await commissionService.getPayoutById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Commission payout details retrieved successfully.', payout);
    } catch (error) { next(error); }
  },

  calculatePayouts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await commissionService.calculatePayouts(req.body.periodStart, req.body.periodEnd);
      ResponseHelper.sendSuccess(req, res, 200, 'Commission payouts calculated successfully.', result);
    } catch (error) { next(error); }
  },

  approvePayout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payout = await commissionService.approvePayout(req.params.id as string, req.user?.id, req.body.notes);
      ResponseHelper.sendSuccess(req, res, 200, 'Commission payout approved successfully.', payout);
    } catch (error) { next(error); }
  },

  payPayout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payout = await commissionService.payPayout(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Commission payout marked as paid successfully.', payout);
    } catch (error) { next(error); }
  },

  getDashboard: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dashboard = await commissionService.getDashboard();
      ResponseHelper.sendSuccess(req, res, 200, 'Commission dashboard data retrieved successfully.', dashboard);
    } catch (error) { next(error); }
  },
};

export default commissionController;
