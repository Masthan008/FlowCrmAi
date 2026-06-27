import { Request, Response, NextFunction } from 'express';
import { contactHistoryService } from '../service/contactHistory.service';
import { ResponseHelper } from '../../helpers/response';

export const contactHistoryController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const history = await contactHistoryService.getHistory(req.params.id as string, req.query.search as string);
      ResponseHelper.sendSuccess(req, res, 200, 'Audit history retrieved successfully.', history);
    } catch (error) {
      next(error);
    }
  }
};

export default contactHistoryController;
