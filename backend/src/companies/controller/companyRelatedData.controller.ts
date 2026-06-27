import { Request, Response, NextFunction } from 'express';
import { companyRelatedDataService } from '../service/companyRelatedData.service';
import { ResponseHelper } from '../../helpers/response';

export const companyRelatedDataController = {
  getContacts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contacts = await companyRelatedDataService.getContacts(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Contacts retrieved successfully.', contacts);
    } catch (error) { next(error); }
  },

  getLeads: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const leads = await companyRelatedDataService.getLeads(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Leads retrieved successfully.', leads);
    } catch (error) { next(error); }
  },

  getLeadsSummary: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await companyRelatedDataService.getLeadsSummary(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Leads summary retrieved successfully.', summary);
    } catch (error) { next(error); }
  },

  getDeals: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deals = await companyRelatedDataService.getDeals(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Deals retrieved successfully.', deals);
    } catch (error) { next(error); }
  },

  getDealsSummary: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await companyRelatedDataService.getDealsSummary(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Deals summary retrieved successfully.', summary);
    } catch (error) { next(error); }
  },

  getQuotes: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const quotes = await companyRelatedDataService.getQuotes(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Quotes retrieved successfully.', quotes);
    } catch (error) { next(error); }
  },

  getInvoices: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const invoices = await companyRelatedDataService.getInvoices(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Invoices retrieved successfully.', invoices);
    } catch (error) { next(error); }
  },

  getPayments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payments = await companyRelatedDataService.getPayments(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Payments retrieved successfully.', payments);
    } catch (error) { next(error); }
  },

  getPaymentsSummary: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await companyRelatedDataService.getPaymentsSummary(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Payments summary retrieved successfully.', summary);
    } catch (error) { next(error); }
  },
};
