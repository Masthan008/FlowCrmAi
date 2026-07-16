import { Request, Response, NextFunction } from 'express';
import { chatService } from '../service/chat.service';
import { ResponseHelper } from '../../helpers/response';

export const chatController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const status = req.query.status as string;
      const assignedToId = req.query.assignedToId as string;

      const result = await chatService.getConversations({ page, limit, status, assignedToId });
      ResponseHelper.sendSuccess(req, res, 200, 'Conversations retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversation = await chatService.getConversationById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Conversation details retrieved successfully.', conversation);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversation = await chatService.createConversation({
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });
      ResponseHelper.sendSuccess(req, res, 201, 'Conversation created successfully.', conversation);
    } catch (error) { next(error); }
  },

  sendMessage: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const message = await chatService.sendMessage(req.params.id as string, req.body);
      ResponseHelper.sendSuccess(req, res, 201, 'Message sent successfully.', message);
    } catch (error) { next(error); }
  },

  assign: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversation = await chatService.assignConversation(req.params.id as string, req.body.assignedToId, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Conversation assigned successfully.', conversation);
    } catch (error) { next(error); }
  },

  close: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversation = await chatService.closeConversation(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Conversation closed successfully.', conversation);
    } catch (error) { next(error); }
  },

  rate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const conversation = await chatService.rateConversation(req.params.id as string, req.body.rating, req.body.ratingComment);
      ResponseHelper.sendSuccess(req, res, 200, 'Conversation rated successfully.', conversation);
    } catch (error) { next(error); }
  },
};

export default chatController;
