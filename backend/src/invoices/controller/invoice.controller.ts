import { Request, Response, NextFunction } from 'express';
import { invoiceService } from '../service/invoice.service';
import { ResponseHelper } from '../../helpers/response';

export const invoiceController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = req.query.search as string;
      const status = req.query.status as string;
      const customerId = req.query.customerId as string;
      const dealId = req.query.dealId as string;

      const result = await invoiceService.getInvoices({ page, limit, search, status, customerId, dealId });
      ResponseHelper.sendSuccess(req, res, 200, 'Invoices retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  getById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invoice = await invoiceService.getInvoiceById(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Invoice details retrieved successfully.', invoice);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invoice = await invoiceService.createInvoice(req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Invoice created successfully.', invoice);
    } catch (error) { next(error); }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invoice = await invoiceService.updateInvoice(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Invoice updated successfully.', invoice);
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await invoiceService.deleteInvoice(req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Invoice deleted successfully.');
    } catch (error) { next(error); }
  },

  recordPayment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payment = await invoiceService.recordPayment(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Payment recorded successfully.', payment);
    } catch (error) { next(error); }
  },

  getPayments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payments = await invoiceService.getInvoicePayments(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Invoice payments retrieved successfully.', payments);
    } catch (error) { next(error); }
  },
};

export default invoiceController;
