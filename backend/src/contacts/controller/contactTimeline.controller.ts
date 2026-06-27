import { Request, Response, NextFunction } from 'express';
import { contactTimelineService } from '../service/contactTimeline.service';
import { ResponseHelper } from '../../helpers/response';

export const contactTimelineController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const timeline = await contactTimelineService.getTimeline(req.params.id as string, req.query.search as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Timeline retrieved successfully.', timeline);
    } catch (error) {
      next(error);
    }
  }
};

export default contactTimelineController;
