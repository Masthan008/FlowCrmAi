import { Request, Response } from 'express';

export interface PaginationInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export const ResponseHelper = {
  /**
   * Send a successful JSON API response
   */
  sendSuccess: (
    req: Request,
    res: Response,
    statusCode: number,
    message: string,
    data: any = null,
    pagination: PaginationInfo | null = null
  ) => {
    return res.status(statusCode).json({
      success: true,
      statusCode,
      message,
      data,
      ...(pagination && { pagination }),
      timestamp: new Date().toISOString(),
      requestId: req.requestId || 'unknown',
    });
  },

  /**
   * Send a failed/error JSON API response
   */
  sendError: (
    req: Request,
    res: Response,
    statusCode: number,
    message: string,
    errors: any = null
  ) => {
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
      requestId: req.requestId || 'unknown',
    });
  }
};
