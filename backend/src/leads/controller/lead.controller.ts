import { Request, Response, NextFunction } from 'express';
import { leadService } from '../service/lead.service';
import { ResponseHelper } from '../../helpers/response';

export const leadController = {
  /**
   * GET /leads
   */
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await leadService.list({
        page: req.query.page as string | undefined,
        limit: req.query.limit as string | undefined,
        search: req.query.search as string | undefined,
        status: req.query.status as string | undefined,
        source: req.query.source as string | undefined,
        priority: req.query.priority as string | undefined,
        owner: req.query.owner as string | undefined,
        sortBy: req.query.sortBy as string | undefined,
        sortDir: req.query.sortDir as string | undefined,
      } as any);

      ResponseHelper.sendSuccess(req, res, 200, 'Leads retrieved successfully.', result.items, {
        page: result.page,
        limit: result.limit,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /leads/statistics
   */
  getStatistics: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await leadService.getStatistics();
      ResponseHelper.sendSuccess(req, res, 200, 'Lead statistics retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /leads/sources
   */
  getSources: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await leadService.getSources();
      ResponseHelper.sendSuccess(req, res, 200, 'Lead sources retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /leads/statuses
   */
  getStatuses: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await leadService.getStatuses();
      ResponseHelper.sendSuccess(req, res, 200, 'Lead statuses retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /leads/:id
   */
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.getById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Lead retrieved successfully.', lead);
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },

  /**
   * POST /leads
   */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.create(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Lead created successfully.', lead);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /leads/:id
   */
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.update(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Lead updated successfully.', lead);
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },

  /**
   * DELETE /leads/:id
   */
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await leadService.delete(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Lead deleted successfully.');
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },

  /**
   * PATCH /leads/:id/status
   */
  updateStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.updateStatus(req.params.id as string, req.body.statusId, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Lead status updated successfully.', lead);
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },

  /**
   * PATCH /leads/:id/owner
   */
  updateOwner: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.updateOwner(req.params.id as string, req.body.assignedToId, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Lead owner updated successfully.', lead);
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },

  /**
   * PATCH /leads/:id/priority
   */
  updatePriority: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.updatePriority(req.params.id as string, req.body.priority, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Lead priority updated successfully.', lead);
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },

  /**
   * PATCH /leads/:id/rating
   */
  updateRating: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const lead = await leadService.updateRating(req.params.id as string, req.body.rating, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Lead rating updated successfully.', lead);
    } catch (error: any) {
      if (error.statusCode === 404) {
        ResponseHelper.sendError(req, res, 404, error.message);
        return;
      }
      next(error);
    }
  },
};

export default leadController;
