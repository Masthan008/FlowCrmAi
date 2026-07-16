import { Request, Response, NextFunction } from 'express';
import { subscriptionService } from '../service/subscription.service';
import { ResponseHelper } from '../../helpers/response';

export const subscriptionController = {
  listPlans: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plans = await subscriptionService.listPlans();
      ResponseHelper.sendSuccess(req, res, 200, 'Plans retrieved successfully.', plans);
    } catch (error) { next(error); }
  },

  createPlan: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plan = await subscriptionService.createPlan(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Plan created successfully.', plan);
    } catch (error) { next(error); }
  },

  updatePlan: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const plan = await subscriptionService.updatePlan(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Plan updated successfully.', plan);
    } catch (error) { next(error); }
  },

  deletePlan: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await subscriptionService.deletePlan(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Plan deleted successfully.');
    } catch (error) { next(error); }
  },

  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const status = req.query.status as string;
      const customerId = req.query.customerId as string;
      const planId = req.query.planId as string;

      const result = await subscriptionService.getSubscriptions({ page, limit, status, customerId, planId });
      ResponseHelper.sendSuccess(req, res, 200, 'Subscriptions retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subscription = await subscriptionService.getSubscriptionById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Subscription details retrieved successfully.', subscription);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subscription = await subscriptionService.createSubscription(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Subscription created successfully.', subscription);
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subscription = await subscriptionService.updateSubscription(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Subscription updated successfully.', subscription);
    } catch (error) { next(error); }
  },

  cancel: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await subscriptionService.cancelSubscription(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Subscription cancelled successfully.');
    } catch (error) { next(error); }
  },

  pause: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subscription = await subscriptionService.updateSubscriptionStatus(req.params.id as string, 'Paused', req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Subscription paused successfully.', subscription);
    } catch (error) { next(error); }
  },

  resume: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subscription = await subscriptionService.updateSubscriptionStatus(req.params.id as string, 'Active', req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Subscription resumed successfully.', subscription);
    } catch (error) { next(error); }
  },
};

export default subscriptionController;
