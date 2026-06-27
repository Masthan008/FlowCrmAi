import { Request, Response, NextFunction } from 'express';
import { hierarchyService } from '../service/hierarchy.service';
import { ResponseHelper } from '../../helpers/response';

export const hierarchyController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hierarchy = await hierarchyService.getHierarchy(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Hierarchy retrieved successfully.', hierarchy);
    } catch (error) { next(error); }
  },

  getTree: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tree = await hierarchyService.getHierarchyTree(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Hierarchy tree retrieved successfully.', tree);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entry = await hierarchyService.createHierarchyEntry(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Hierarchy entry created successfully.', entry);
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await hierarchyService.deleteHierarchyEntry(req.params.entryId as string, req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Hierarchy entry deleted successfully.');
    } catch (error) { next(error); }
  },
};
