import { Request, Response, NextFunction } from 'express';
import { contractService } from '../service/contract.service';
import { ResponseHelper } from '../../helpers/response';

export const contractController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const type = req.query.type as string;
      const customerId = req.query.customerId as string;

      const result = await contractService.getContracts({ page, limit, search, status, type, customerId });
      ResponseHelper.sendSuccess(req, res, 200, 'Contracts retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contract = await contractService.getContractById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Contract details retrieved successfully.', contract);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contract = await contractService.createContract(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Contract created successfully.', contract);
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contract = await contractService.updateContract(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Contract updated successfully.', contract);
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await contractService.deleteContract(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Contract deleted successfully.');
    } catch (error) { next(error); }
  },

  approve: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contract = await contractService.updateContractStatus(req.params.id as string, 'Approved', req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Contract approved successfully.', contract);
    } catch (error) { next(error); }
  },

  renew: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contract = await contractService.renewContract(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Contract renewed successfully.', contract);
    } catch (error) { next(error); }
  },

  terminate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contract = await contractService.updateContractStatus(req.params.id as string, 'Terminated', req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Contract terminated successfully.', contract);
    } catch (error) { next(error); }
  },
};

export default contractController;
