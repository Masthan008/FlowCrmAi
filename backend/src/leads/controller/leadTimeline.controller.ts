import { Request, Response, NextFunction } from 'express';
import { leadTimelineService } from '../service/leadTimeline.service';
import { ResponseHelper } from '../../helpers/response';

export const leadTimelineController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        search: req.query.search as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      };
      const timeline = await leadTimelineService.getTimeline(req.params.id as string, filters);
      ResponseHelper.sendSuccess(req, res, 200, 'Timeline retrieved successfully.', timeline);
    } catch (error) {
      next(error);
    }
  }
};
export default leadTimelineController;
