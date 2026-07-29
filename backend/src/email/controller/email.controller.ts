import { Request, Response, NextFunction } from 'express';
import { emailService } from '../service/email.service';
import { ResponseHelper } from '../../helpers/response';

export const emailController = {
  listAccounts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accounts = await emailService.listAccounts(req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Email accounts retrieved successfully.', accounts);
    } catch (error) { next(error); }
  },

  addAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const account = await emailService.addAccount(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Email account added successfully.', account);
    } catch (error) { next(error); }
  },

  updateAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const account = await emailService.updateAccount(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Email account updated successfully.', account);
    } catch (error) { next(error); }
  },

  removeAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await emailService.removeAccount(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Email account removed successfully.');
    } catch (error) { next(error); }
  },

  syncAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await emailService.syncAccount(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Email sync initiated successfully.', result);
    } catch (error) { next(error); }
  },

  listMessages: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const accountId = (req.params.id as string) || (req.query.accountId as string);

      const result = await emailService.listMessages(accountId, { page, limit });
      ResponseHelper.sendSuccess(req, res, 200, 'Messages retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  getMessage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const message = await emailService.getMessage(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Message retrieved successfully.', message);
    } catch (error) { next(error); }
  },

  markAsRead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const message = await emailService.markAsRead(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Message marked as read successfully.', message);
    } catch (error) { next(error); }
  },

  toggleStar: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const message = await emailService.toggleStar(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Message star toggled successfully.', message);
    } catch (error) { next(error); }
  },

  send: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await emailService.sendEmail(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Email sent successfully.', result);
    } catch (error) { next(error); }
  },
};

export default emailController;
