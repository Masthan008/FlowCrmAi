import { Request, Response, NextFunction } from 'express';
import { quoteService } from '../service/quote.service';
import { ResponseHelper } from '../../helpers/response';

export const quoteController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const customerId = req.query.customerId as string;
      const dealId = req.query.dealId as string;

      const result = await quoteService.getQuotes({ page, limit, search, status, customerId, dealId });
      ResponseHelper.sendSuccess(req, res, 200, 'Quotes retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const quote = await quoteService.getQuoteById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Quote details retrieved successfully.', quote);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const quote = await quoteService.createQuote(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Quote created successfully.', quote);
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const quote = await quoteService.updateQuote(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Quote updated successfully.', quote);
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await quoteService.deleteQuote(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Quote deleted successfully.');
    } catch (error) { next(error); }
  },
};

export default quoteController;
