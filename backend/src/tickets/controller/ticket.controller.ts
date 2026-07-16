import { Request, Response, NextFunction } from 'express';
import { ticketService } from '../service/ticket.service';
import { ResponseHelper } from '../../helpers/response';

export const ticketController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const priority = req.query.priority as string;
      const category = req.query.category as string;
      const assignedTo = req.query.assignedTo as string;

      const result = await ticketService.getTickets({ page, limit, search, status, priority, category, assignedTo });
      ResponseHelper.sendSuccess(req, res, 200, 'Tickets retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticket = await ticketService.getTicketById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Ticket details retrieved successfully.', ticket);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticket = await ticketService.createTicket(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Ticket created successfully.', ticket);
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticket = await ticketService.updateTicket(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Ticket updated successfully.', ticket);
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ticketService.deleteTicket(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Ticket deleted successfully.');
    } catch (error) { next(error); }
  },

  updateStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticket = await ticketService.updateTicketStatus(req.params.id as string, req.body.status, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Ticket status updated successfully.', ticket);
    } catch (error) { next(error); }
  },

  updatePriority: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticket = await ticketService.updateTicketPriority(req.params.id as string, req.body.priority, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Ticket priority updated successfully.', ticket);
    } catch (error) { next(error); }
  },

  assign: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticket = await ticketService.assignTicket(req.params.id as string, req.body.assignedToId, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Ticket assigned successfully.', ticket);
    } catch (error) { next(error); }
  },

  getComments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comments = await ticketService.getTicketComments(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Comments retrieved successfully.', comments);
    } catch (error) { next(error); }
  },

  addComment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comment = await ticketService.addTicketComment(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Comment added successfully.', comment);
    } catch (error) { next(error); }
  },

  deleteComment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ticketService.deleteTicketComment(req.params.id as string, req.params.commentId as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Comment deleted successfully.');
    } catch (error) { next(error); }
  },

  getAttachments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const attachments = await ticketService.getTicketAttachments(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Attachments retrieved successfully.', attachments);
    } catch (error) { next(error); }
  },

  uploadAttachment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const attachment = await ticketService.uploadTicketAttachment(req.params.id as string, req.file as Express.Multer.File, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Attachment uploaded successfully.', attachment);
    } catch (error) { next(error); }
  },

  deleteAttachment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ticketService.deleteTicketAttachment(req.params.id as string, req.params.attachmentId as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Attachment deleted successfully.');
    } catch (error) { next(error); }
  },

  getTimeLogs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const timeLogs = await ticketService.getTicketTimeLogs(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Time logs retrieved successfully.', timeLogs);
    } catch (error) { next(error); }
  },

  logTime: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const timeLog = await ticketService.logTicketTime(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Time logged successfully.', timeLog);
    } catch (error) { next(error); }
  },

  getStatistics: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const statistics = await ticketService.getTicketStatistics();
      ResponseHelper.sendSuccess(req, res, 200, 'Ticket statistics retrieved successfully.', statistics);
    } catch (error) { next(error); }
  },
};

export default ticketController;
