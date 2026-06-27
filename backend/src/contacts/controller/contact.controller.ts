import { Request, Response, NextFunction } from 'express';
import { contactService } from '../service/contact.service';
import { ResponseHelper } from '../../helpers/response';

export const contactController = {
  /**
   * GET /contacts
   */
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUserId = req.user?.id;
      const result = await contactService.list(req.query, currentUserId);

      ResponseHelper.sendSuccess(
        req,
        res,
        200,
        'Contacts retrieved successfully.',
        result.items,
        {
          page: result.page,
          limit: result.limit,
          totalItems: result.totalItems,
          totalPages: result.totalPages,
        }
      );
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /contacts/statistics
   */
  getStatistics: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await contactService.getStatistics(req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Contact statistics retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /contacts/:id
   */
  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const contact = await contactService.getById(id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Contact retrieved successfully.', contact);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /contacts
   */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUserId = req.user?.id || 'system';
      const contact = await contactService.create(req.body, currentUserId);
      ResponseHelper.sendSuccess(req, res, 201, 'Contact created successfully.', contact);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /contacts/:id
   */
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.id || 'system';
      const contact = await contactService.update(id as string, req.body, currentUserId);
      ResponseHelper.sendSuccess(req, res, 200, 'Contact updated successfully.', contact);
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /contacts/:id
   */
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.id || 'system';
      await contactService.delete(id as string, currentUserId);
      ResponseHelper.sendSuccess(req, res, 200, 'Contact deleted successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /contacts/status (Bulk status update)
   */
  bulkUpdateStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids, status } = req.body;
      const currentUserId = req.user?.id || 'system';
      const result = await contactService.bulkUpdateStatus(ids, status, currentUserId);
      ResponseHelper.sendSuccess(req, res, 200, 'Contacts status updated successfully.', result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /contacts/owner (Bulk owner update)
   */
  bulkUpdateOwner: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids, ownerId } = req.body;
      const currentUserId = req.user?.id || 'system';
      const result = await contactService.bulkUpdateOwner(ids, ownerId, currentUserId);
      ResponseHelper.sendSuccess(req, res, 200, 'Contacts owner updated successfully.', result);
    } catch (error) {
      next(error);
    }
  },
};

export default contactController;
