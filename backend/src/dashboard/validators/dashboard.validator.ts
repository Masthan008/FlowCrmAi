import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '../../helpers/response';

/**
 * Validates the global timeframe filter query
 */
export const validateTimeframe = (req: Request, res: Response, next: NextFunction) => {
  const timeframe = (req.query.timeframe as string) || '30d';
  const allowed = ['today', 'yesterday', '3d', '7d', '30d', 'quarter', 'year', 'custom'];

  if (!allowed.includes(timeframe.toLowerCase())) {
    return ResponseHelper.sendError(
      req,
      res,
      400,
      `Invalid filter timeframe: '${timeframe}'. Allowed: ${allowed.join(', ')}`
    );
  }

  next();
};

export default validateTimeframe;
