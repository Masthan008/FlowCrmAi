import { Request, Response, NextFunction } from 'express';
import { dealService } from '../service/deal.service';
import { ResponseHelper } from '../../helpers/response';

export const dealController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await dealService.list(req.query, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Deals retrieved successfully.', result.items, {
        page: result.page,
        limit: result.limit,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  },

  getStatistics: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealService.getStatistics(req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal statistics retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deal = await dealService.getById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal retrieved successfully.', deal);
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
      const deal = await dealService.create(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Deal created successfully.', deal);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deal = await dealService.update(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal updated successfully.', deal);
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
      await dealService.delete(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal deleted successfully.');
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },

  bulkUpdateStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids, status } = req.body;
      await dealService.bulkUpdateStatus(ids, status, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal statuses updated successfully.');
    } catch (error) {
      next(error);
    }
  },

  updateStage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, stageId } = req.body;
      const deal = await dealService.updateStage(id, stageId, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal stage updated successfully.', deal);
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },

  bulkUpdateOwner: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids, ownerId } = req.body;
      await dealService.bulkUpdateOwner(ids, ownerId, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal owners updated successfully.');
    } catch (error) {
      next(error);
    }
  },

  getEmployees: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealService.getEmployees();
      ResponseHelper.sendSuccess(req, res, 200, 'Employees retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  },
};

export default dealController;
