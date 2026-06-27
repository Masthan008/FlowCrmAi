import { Request, Response, NextFunction } from 'express';
import { contactFileService } from '../service/contactFile.service';
import { ResponseHelper } from '../../helpers/response';

export const contactFileController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = await contactFileService.getFiles(req.params.id as string, req.query.search as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Files retrieved successfully.', files);
    } catch (error) {
      next(error);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = await contactFileService.createFile(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'File uploaded successfully.', file);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await contactFileService.deleteFile(req.params.fileId as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'File deleted successfully.');
    } catch (error) {
      next(error);
    }
  }
};

export default contactFileController;
