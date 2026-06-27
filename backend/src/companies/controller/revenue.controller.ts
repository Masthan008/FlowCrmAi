import { Request, Response, NextFunction } from 'express';
import { revenueService } from '../service/revenue.service';
import { companyRelatedDataService } from '../service/companyRelatedData.service';
import { ResponseHelper } from '../../helpers/response';

export const revenueController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const revenue = await revenueService.getRevenue(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Revenue data retrieved successfully.', revenue);
    } catch (error) { next(error); }
  },

  getSummary: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await revenueService.getRevenueSummary(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Revenue summary retrieved successfully.', summary);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entry = await revenueService.createRevenueEntry(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Revenue entry created successfully.', entry);
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await revenueService.deleteRevenueEntry(req.params.entryId as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Revenue entry deleted successfully.');
    } catch (error) { next(error); }
  },

  getDashboard: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dashboard = await companyRelatedDataService.getRevenueDashboard(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Revenue dashboard retrieved successfully.', dashboard);
    } catch (error) { next(error); }
  },
};
