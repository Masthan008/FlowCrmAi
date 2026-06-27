import { Request, Response, NextFunction } from 'express';
import { businessNetworkService } from '../service/businessNetwork.service';
import { ResponseHelper } from '../../helpers/response';

export const businessNetworkController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const network = await businessNetworkService.getNetwork(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Business network retrieved successfully.', network);
    } catch (error) { next(error); }
  },

  getGrouped: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const grouped = await businessNetworkService.getGroupedNetwork(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Business network grouped successfully.', grouped);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entry = await businessNetworkService.createNetworkEntry(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Network entry created successfully.', entry);
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entry = await businessNetworkService.updateNetworkEntry(req.params.entryId as string, req.body, req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Network entry updated successfully.', entry);
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await businessNetworkService.deleteNetworkEntry(req.params.entryId as string, req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Network entry deleted successfully.');
    } catch (error) { next(error); }
  },
};
