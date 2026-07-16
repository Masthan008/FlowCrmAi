import { Request, Response, NextFunction } from 'express';
import { assetService } from '../service/asset.service';
import { ResponseHelper } from '../../helpers/response';

export const assetController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const type = req.query.type as string;
      const status = req.query.status as string;
      const assignedToId = req.query.assignedToId as string;
      const search = req.query.search as string;

      const result = await assetService.getAssets({ page, limit, type, status, assignedToId, search });
      ResponseHelper.sendSuccess(req, res, 200, 'Assets retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const asset = await assetService.getAssetById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Asset details retrieved successfully.', asset);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const asset = await assetService.createAsset(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Asset created successfully.', asset);
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const asset = await assetService.updateAsset(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Asset updated successfully.', asset);
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await assetService.deleteAsset(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Asset deleted successfully.');
    } catch (error) { next(error); }
  },

  assign: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const asset = await assetService.assignAsset(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Asset assigned successfully.', asset);
    } catch (error) { next(error); }
  },

  retire: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const asset = await assetService.retireAsset(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Asset retired successfully.', asset);
    } catch (error) { next(error); }
  },
};

export default assetController;
