import { Request, Response, NextFunction } from 'express';
import { companyActivityService } from '../service/companyActivity.service';
import { ResponseHelper } from '../../helpers/response';

export const companyActivityController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        search: req.query.search as string | undefined,
        type: req.query.type as string | undefined,
        priority: req.query.priority as string | undefined,
        status: req.query.status as string | undefined,
        createdBy: req.query.createdBy as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      };
      const activities = await companyActivityService.getActivities(req.params.id as string, filters);
      ResponseHelper.sendSuccess(req, res, 200, 'Activities retrieved successfully.', activities);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activity = await companyActivityService.createActivity(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Activity created successfully.', activity);
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activity = await companyActivityService.updateActivity(req.params.activityId as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Activity updated successfully.', activity);
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await companyActivityService.deleteActivity(req.params.activityId as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Activity deleted successfully.');
    } catch (error) { next(error); }
  },
};
