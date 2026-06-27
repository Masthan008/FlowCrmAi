import { Request, Response, NextFunction } from 'express';
import { contactActivityService } from '../service/contactActivity.service';
import { ResponseHelper } from '../../helpers/response';

export const contactActivityController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activities = await contactActivityService.getActivities(req.params.id as string, req.query);
      ResponseHelper.sendSuccess(req, res, 200, 'Activities retrieved successfully.', activities);
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activity = await contactActivityService.createActivity(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Activity created successfully.', activity);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activity = await contactActivityService.updateActivity(req.params.activityId as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Activity updated successfully.', activity);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await contactActivityService.deleteActivity(req.params.activityId as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Activity deleted successfully.');
    } catch (error) {
      next(error);
    }
  }
};

export default contactActivityController;
