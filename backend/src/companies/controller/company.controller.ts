import { Request, Response, NextFunction } from 'express';
import { companyService } from '../service/company.service';
import { ResponseHelper } from '../../helpers/response';

export const companyController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUserId = req.user?.id;
      const result = await companyService.list(req.query, currentUserId);

      ResponseHelper.sendSuccess(
        req, res, 200, 'Companies retrieved successfully.',
        result.items,
        { page: result.page, limit: result.limit, totalItems: result.totalItems, totalPages: result.totalPages }
      );
    } catch (error) {
      next(error);
    }
  },

  getStatistics: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await companyService.getStatistics(req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Company statistics retrieved successfully.', data);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const company = await companyService.getById(id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Company retrieved successfully.', company);
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUserId = req.user?.id;
      const company = await companyService.create(req.body, currentUserId!);
      ResponseHelper.sendSuccess(req, res, 201, 'Company created successfully.', company);
    } catch (error) {
      next(error);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.id;
      const company = await companyService.update(id as string, req.body, currentUserId!);
      ResponseHelper.sendSuccess(req, res, 200, 'Company updated successfully.', company);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.id;
      await companyService.delete(id as string, currentUserId!);
      ResponseHelper.sendSuccess(req, res, 200, 'Company deleted successfully.');
    } catch (error) {
      next(error);
    }
  },

  bulkUpdateStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids, status } = req.body;
      const currentUserId = req.user?.id;
      await companyService.bulkUpdateStatus(ids, status, currentUserId!);
      ResponseHelper.sendSuccess(req, res, 200, 'Company statuses updated successfully.');
    } catch (error) {
      next(error);
    }
  },

  bulkUpdateOwner: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids, ownerId } = req.body;
      const currentUserId = req.user?.id;
      await companyService.bulkUpdateOwner(ids, ownerId, currentUserId!);
      ResponseHelper.sendSuccess(req, res, 200, 'Company owners updated successfully.');
    } catch (error) {
      next(error);
    }
  },

  getEmployees: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const employees = await companyService.getEmployees();
      ResponseHelper.sendSuccess(req, res, 200, 'Employees retrieved successfully.', employees);
    } catch (error) {
      next(error);
    }
  },
};
