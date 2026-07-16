import { Request, Response, NextFunction } from 'express';
import { gdprService } from '../service/gdpr.service';
import { ResponseHelper } from '../../helpers/response';

export const gdprController = {
  listConsentLogs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const contactId = req.query.contactId as string;
      const companyId = req.query.companyId as string;
      const type = req.query.type as string;

      const result = await gdprService.getConsentLogs({ page, limit, contactId, companyId, type });
      ResponseHelper.sendSuccess(req, res, 200, 'Consent logs retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  recordConsent: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const log = await gdprService.recordConsent(req.body);
      ResponseHelper.sendSuccess(req, res, 201, 'Consent recorded successfully.', log);
    } catch (error) { next(error); }
  },

  revokeConsent: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const log = await gdprService.revokeConsent(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Consent revoked successfully.', log);
    } catch (error) { next(error); }
  },

  listDataRequests: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const type = req.query.type as string;
      const status = req.query.status as string;

      const result = await gdprService.getDataRequests({ page, limit, type, status });
      ResponseHelper.sendSuccess(req, res, 200, 'Data requests retrieved successfully.', result);
    } catch (error) { next(error); }
  },

  createDataRequest: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = await gdprService.createDataRequest(req.body);
      ResponseHelper.sendSuccess(req, res, 201, 'Data request created successfully.', request);
    } catch (error) { next(error); }
  },

  processDataRequest: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = await gdprService.processDataRequest(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Data request processing started.', request);
    } catch (error) { next(error); }
  },

  completeDataRequest: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = await gdprService.completeDataRequest(req.params.id as string, req.body.responseData);
      ResponseHelper.sendSuccess(req, res, 200, 'Data request completed successfully.', request);
    } catch (error) { next(error); }
  },

  rejectDataRequest: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = await gdprService.rejectDataRequest(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Data request rejected.', request);
    } catch (error) { next(error); }
  },
};

export default gdprController;
