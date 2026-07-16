import { Request, Response, NextFunction } from 'express';
import { webFormService } from '../service/webform.service';
import { ResponseHelper } from '../../helpers/response';

export const webFormController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string;

      const result = await webFormService.getWebForms({ page, limit, search });
      ResponseHelper.sendSuccess(req, res, 200, 'Web forms retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const form = await webFormService.getWebFormById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Web form details retrieved successfully.', form);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const form = await webFormService.createWebForm(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Web form created successfully.', form);
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const form = await webFormService.updateWebForm(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Web form updated successfully.', form);
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await webFormService.deleteWebForm(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Web form deleted successfully.');
    } catch (error) { next(error); }
  },

  activate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const form = await webFormService.activateForm(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Web form activated successfully.', form);
    } catch (error) { next(error); }
  },

  deactivate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const form = await webFormService.deactivateForm(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Web form deactivated successfully.', form);
    } catch (error) { next(error); }
  },

  getSubmissions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const result = await webFormService.getSubmissions(req.params.id as string, { page, limit });
      ResponseHelper.sendSuccess(req, res, 200, 'Submissions retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  getEmbedCode: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await webFormService.getEmbedCode(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Embed code generated successfully.', result);
    } catch (error) { next(error); }
  },

  submitPublic: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const submission = await webFormService.submitPublic(
        req.params.id as string,
        req.body,
        req.ip,
        req.headers['user-agent']
      );
      ResponseHelper.sendSuccess(req, res, 201, 'Form submitted successfully.', submission);
    } catch (error) { next(error); }
  },
};

export default webFormController;
