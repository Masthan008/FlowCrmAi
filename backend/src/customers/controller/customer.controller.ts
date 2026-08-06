import { Request, Response, NextFunction } from 'express';
import { customerService } from '../service/customer.service';
import { ResponseHelper } from '../../helpers/response';

export const customerController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await customerService.list(req.query);
      ResponseHelper.sendSuccess(req, res, 200, 'Customers retrieved successfully.', result.items, {
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
      const customer = await customerService.getById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Customer details retrieved.', customer);
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
      const customer = await customerService.create(req.body, userId);
      ResponseHelper.sendSuccess(req, res, 201, 'Customer created successfully.', customer);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const customer = await customerService.update(req.params.id as string, req.body, userId);
      ResponseHelper.sendSuccess(req, res, 200, 'Customer updated successfully.', customer);
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
      await customerService.delete(req.params.id as string, userId);
      ResponseHelper.sendSuccess(req, res, 200, 'Customer deleted successfully.');
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },
};
