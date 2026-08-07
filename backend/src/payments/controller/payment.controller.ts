import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../service/payment.service';
import { ResponseHelper } from '../../helpers/response';

export const paymentController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await paymentService.list(req.query);
      ResponseHelper.sendSuccess(req, res, 200, 'Payments retrieved successfully.', result.items, {
        page: result.page,
        limit: result.limit,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payment = await paymentService.getById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Payment details retrieved.', payment);
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const payment = await paymentService.create(req.body, userId);
      ResponseHelper.sendSuccess(req, res, 201, 'Payment recorded successfully.', payment);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const payment = await paymentService.update(req.params.id as string, req.body, userId);
      ResponseHelper.sendSuccess(req, res, 200, 'Payment updated successfully.', payment);
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      await paymentService.delete(req.params.id as string, userId);
      ResponseHelper.sendSuccess(req, res, 200, 'Payment deleted successfully.');
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },

  processPayment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const result = await paymentService.processSubscriptionPayment({ ...req.body, userId });
      ResponseHelper.sendSuccess(req, res, 200, 'Payment processed & subscription activated successfully.', result);
    } catch (error) {
      next(error);
    }
  },
};

export default paymentController;
