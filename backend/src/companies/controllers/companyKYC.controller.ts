import { Request, Response, NextFunction } from 'express';
import { cvrRegistryService } from '../services/cvrRegistry.service';
import { companyKYCService } from '../services/companyKYC.service';
import { ResponseHelper } from '../../helpers/response';

export const companyKYCController = {
  searchCVR: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = (req.query.query as string) || '';
      const results = await cvrRegistryService.searchCVR(query);
      ResponseHelper.sendSuccess(req, res, 200, 'CVR Registry search results fetched.', results);
    } catch (error) {
      next(error);
    }
  },

  getKYC: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const kyc = await companyKYCService.getKYCByCompanyId(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Company KYC compliance details fetched.', kyc);
    } catch (error) {
      next(error);
    }
  },

  updateKYC: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await companyKYCService.updateKYC(
        req.params.id as string,
        req.body,
        req.user?.email || 'Compliance Officer'
      );
      ResponseHelper.sendSuccess(req, res, 200, 'Company KYC compliance updated.', updated);
    } catch (error) {
      next(error);
    }
  }
};
