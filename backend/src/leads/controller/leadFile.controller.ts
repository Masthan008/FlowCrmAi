import { Request, Response, NextFunction } from 'express';
import { leadFileService } from '../service/leadFile.service';
import { ResponseHelper } from '../../helpers/response';

export const leadFileController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = await leadFileService.getFiles(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Files retrieved successfully.', files);
    } catch (error) {
      next(error);
    }
  },

  getStorageSummary: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await leadFileService.getStorageSummary(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Storage summary retrieved successfully.', summary);
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        ResponseHelper.sendError(req, res, 400, 'No file uploaded.');
        return;
      }
      const file = await leadFileService.createFile(req.params.id as string, req.file, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'File uploaded successfully.', file);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await leadFileService.deleteFile(req.params.fileId as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'File deleted successfully.');
    } catch (error) {
      next(error);
    }
  }
};
export default leadFileController;
