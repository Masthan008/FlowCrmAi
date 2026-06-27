import { Request, Response, NextFunction } from 'express';
import { customerJourneyService } from '../service/customerJourney.service';
import { ResponseHelper } from '../../helpers/response';

export const customerJourneyController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const journey = await customerJourneyService.getJourney(req.params.id as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Customer journey retrieved successfully.', journey);
    } catch (error) { next(error); }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entry = await customerJourneyService.createJourneyEntry(req.params.id as string, req.body, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 201, 'Journey entry created successfully.', entry);
    } catch (error) { next(error); }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await customerJourneyService.deleteJourneyEntry(req.params.entryId as string, req.params.id as string, req.user?.id);
      ResponseHelper.sendSuccess(req, res, 200, 'Journey entry deleted successfully.');
    } catch (error) { next(error); }
  },
};
