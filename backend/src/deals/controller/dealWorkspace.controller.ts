import { Request, Response, NextFunction } from 'express';
import { dealWorkspaceService } from '../service/dealWorkspace.service';
import { ResponseHelper } from '../../helpers/response';

export const dealWorkspaceController = {
  getProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealWorkspaceService.getProfile(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal profile loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  getTimeline: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealWorkspaceService.getTimeline(req.params.id as string, req.query.search as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal timeline loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  getNotes: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealWorkspaceService.getNotes(req.params.id as string, req.query.search as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal notes loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  createNote: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const note = await dealWorkspaceService.createNote(req.params.id as string, {
        title: req.body.title as string,
        content: req.body.content as string,
        createdBy: (req.user?.email || 'system') as string
      });
      ResponseHelper.sendSuccess(req, res, 201, 'Deal note created successfully.', note);
    } catch (error) {
      next(error);
    }
  },

  updateNote: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const note = await dealWorkspaceService.updateNote(req.params.noteId as string, {
        title: req.body.title as string,
        content: req.body.content as string,
        isPinned: req.body.isPinned as boolean,
        updatedBy: (req.user?.email || 'system') as string
      });
      ResponseHelper.sendSuccess(req, res, 200, 'Deal note updated.', note);
    } catch (error) {
      next(error);
    }
  },

  deleteNote: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await dealWorkspaceService.deleteNote(req.params.noteId as string, (req.user?.email || 'system') as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal note removed.');
    } catch (error) {
      next(error);
    }
  },

  getActivities: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        type: req.query.type as string,
        priority: req.query.priority as string,
        status: req.query.status as string,
        search: req.query.search as string,
      };
      const data = await dealWorkspaceService.getActivities(req.params.id as string, filters);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal activities loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  createActivity: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activity = await dealWorkspaceService.createActivity(
        req.params.id as string,
        req.body,
        (req.user?.email || 'system') as string
      );
      ResponseHelper.sendSuccess(req, res, 201, 'Deal activity scheduled.', activity);
    } catch (error) {
      next(error);
    }
  },

  updateActivity: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activity = await dealWorkspaceService.updateActivity(
        req.params.activityId as string,
        req.body,
        (req.user?.email || 'system') as string
      );
      ResponseHelper.sendSuccess(req, res, 200, 'Deal activity updated.', activity);
    } catch (error) {
      next(error);
    }
  },

  deleteActivity: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await dealWorkspaceService.deleteActivity(req.params.activityId as string, (req.user?.email || 'system') as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal activity removed.');
    } catch (error) {
      next(error);
    }
  },

  getFiles: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealWorkspaceService.getFiles(req.params.id as string, req.query.search as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal files loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  createFile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = await dealWorkspaceService.createFile(
        req.params.id as string,
        {
          name: req.body.name as string,
          path: req.body.path as string,
          mimeType: req.body.mimeType as string,
          size: req.body.size as number,
        },
        (req.user?.email || 'system') as string
      );
      ResponseHelper.sendSuccess(req, res, 201, 'File attached successfully.', file);
    } catch (error) {
      next(error);
    }
  },

  deleteFile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await dealWorkspaceService.deleteFile(req.params.fileId as string, (req.user?.email || 'system') as string);
      ResponseHelper.sendSuccess(req, res, 200, 'File attachment removed.');
    } catch (error) {
      next(error);
    }
  },

  getHistory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealWorkspaceService.getHistory(req.params.id as string, req.query.search as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal history loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  getProducts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealWorkspaceService.getProducts(req.params.id as string, req.query.search as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal products loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  getQuotes: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealWorkspaceService.getQuotes(req.params.id as string, req.query.search as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal quotes loaded.', data);
    } catch (error) {
      next(error);
    }
  },
};
