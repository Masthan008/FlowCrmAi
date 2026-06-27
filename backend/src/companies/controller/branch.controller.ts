import { Request, Response, NextFunction } from 'express';
import { branchService } from '../service/branch.service';
import { ResponseHelper } from '../../helpers/response';

export const branchController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const branches = await branchService.getBranches(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Branches retrieved successfully.', branches);
    } catch (error) { next(error); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const branch = await branchService.getBranch(req.params.branchId as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Branch retrieved successfully.', branch);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const branch = await branchService.createBranch(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Branch created successfully.', branch);
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const branch = await branchService.updateBranch(req.params.branchId as string, req.body, req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Branch updated successfully.', branch);
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await branchService.deleteBranch(req.params.branchId as string, req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Branch deleted successfully.');
    } catch (error) { next(error); }
  },
};
