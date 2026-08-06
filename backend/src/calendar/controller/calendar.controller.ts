import { Request, Response, NextFunction } from 'express';
import { calendarService } from '../service/calendar.service';
import { ResponseHelper } from '../../helpers/response';

export const calendarController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await calendarService.list(req.query);
      ResponseHelper.sendSuccess(req, res, 200, 'Calendar events retrieved successfully.', result.items, {
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
      const event = await calendarService.getById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Calendar event details retrieved.', event);
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
      const event = await calendarService.create(req.body, userId);
      ResponseHelper.sendSuccess(req, res, 201, 'Calendar event created successfully.', event);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const event = await calendarService.update(req.params.id as string, req.body, userId);
      ResponseHelper.sendSuccess(req, res, 200, 'Calendar event updated successfully.', event);
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
      await calendarService.delete(req.params.id as string, userId);
      ResponseHelper.sendSuccess(req, res, 200, 'Calendar event deleted successfully.');
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },
};
