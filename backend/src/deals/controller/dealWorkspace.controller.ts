import { Request, Response, NextFunction } from 'express';
import { dealWorkspaceService } from '../service/dealWorkspace.service';
import { ResponseHelper } from '../../helpers/response';
import { prisma } from '../../database/db';

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

  addProductLine: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealWorkspaceService.addProductLine(req.params.id as string, req.body, req.user?.email || 'system');
      ResponseHelper.sendSuccess(req, res, 201, 'Deal product created successfully.', data);
    } catch (error) {
      next(error);
    }
  },

  updateProductLine: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealWorkspaceService.updateProductLine(req.params.productId as string, req.body, req.user?.email || 'system');
      ResponseHelper.sendSuccess(req, res, 200, 'Deal product updated successfully.', data);
    } catch (error) {
      next(error);
    }
  },

  deleteProductLine: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await dealWorkspaceService.deleteProductLine(req.params.productId as string, req.user?.email || 'system');
      ResponseHelper.sendSuccess(req, res, 200, 'Deal product line deleted.');
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

  createQuote: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealWorkspaceService.createQuote(req.params.id as string, req.body, req.user?.email || 'system');
      ResponseHelper.sendSuccess(req, res, 201, 'Deal quote prepared successfully.', data);
    } catch (error) {
      next(error);
    }
  },

  updateQuote: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealWorkspaceService.updateQuote(req.params.quoteId as string, req.body, req.user?.email || 'system');
      ResponseHelper.sendSuccess(req, res, 200, 'Deal quote updated successfully.', data);
    } catch (error) {
      next(error);
    }
  },

  approveQuote: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealWorkspaceService.approveQuote(req.params.quoteId as string, req.user?.id || req.user?.email || 'system');
      ResponseHelper.sendSuccess(req, res, 200, 'Quote approved successfully.', data);
    } catch (error) {
      next(error);
    }
  },

  rejectQuote: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealWorkspaceService.rejectQuote(req.params.quoteId as string, req.user?.id || req.user?.email || 'system');
      ResponseHelper.sendSuccess(req, res, 200, 'Quote rejected successfully.', data);
    } catch (error) {
      next(error);
    }
  },

  getCompetitors: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealWorkspaceService.getCompetitors(req.params.id as string, req.query.search as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal competitors loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  createCompetitor: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealWorkspaceService.createCompetitor(req.params.id as string, req.body, req.user?.email || 'system');
      ResponseHelper.sendSuccess(req, res, 201, 'Competitor added successfully.', data);
    } catch (error) {
      next(error);
    }
  },

  getCollaboration: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealWorkspaceService.getCollaboration(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal collaboration loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  createComment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const employee = await prisma.employee.findFirst({
        where: { userId: req.user?.id || undefined }
      });
      const data = await dealWorkspaceService.createComment(req.params.id as string, {
        comment: req.body.comment as string,
        employeeId: employee?.id || undefined,
        parentId: req.body.parentId || undefined,
        isPinned: req.body.isPinned || false,
        emoji: req.body.emoji || null
      }, req.user?.email || 'system');
      ResponseHelper.sendSuccess(req, res, 201, 'Comment added successfully.', data);
    } catch (error) {
      next(error);
    }
  },

  getChecklist: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealWorkspaceService.getChecklist(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal checklist loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  updateChecklistItem: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealWorkspaceService.updateChecklistItem(req.params.itemId as string, req.body.isCompleted as boolean, req.user?.email || 'system');
      ResponseHelper.sendSuccess(req, res, 200, 'Checklist item updated.', data);
    } catch (error) {
      next(error);
    }
  },

  getNegotiations: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealWorkspaceService.getNegotiations(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Deal negotiations loaded.', data);
    } catch (error) {
      next(error);
    }
  },

  createNegotiation: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await dealWorkspaceService.createNegotiation(req.params.id as string, req.body, req.user?.email || 'system');
      ResponseHelper.sendSuccess(req, res, 201, 'Negotiation round created.', data);
    } catch (error) {
      next(error);
    }
  },
};
