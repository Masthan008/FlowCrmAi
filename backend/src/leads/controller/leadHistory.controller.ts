import { Request, Response, NextFunction } from 'express';
import { leadHistoryService } from '../service/leadHistory.service';
import { ResponseHelper } from '../../helpers/response';

export const leadHistoryController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        search: req.query.search as string | undefined,
      };
      const history = await leadHistoryService.getHistory(req.params.id as string, filters);
      ResponseHelper.sendSuccess(req, res, 200, 'History retrieved successfully.', history);
    } catch (error) {
      next(error);
    }
  }
};
export default leadHistoryController;
