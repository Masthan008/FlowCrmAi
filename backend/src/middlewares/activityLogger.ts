import { Request, Response, NextFunction } from 'express';
import { auditLogRepository } from '../repositories/auditLog.repository';
import { logger } from './logger';

export const logActivity = (moduleName: string, actionName: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Intercept standard response to log only on success
    const originalSend = res.send;
    
    res.send = function (body): any {
      res.send = originalSend; // restore send method
      
      // Perform logging asynchronously after response completes
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const ipAddress = req.ip || req.socket.remoteAddress;
        const browser = req.headers['user-agent'];
        const userId = req.user?.id;

        auditLogRepository.logEvent({
          userId,
          action: actionName,
          module: moduleName,
          ipAddress,
          browser,
          details: {
            method: req.method,
            url: req.originalUrl,
            params: req.params,
            query: req.query,
          },
          createdBy: userId || 'system',
        }).catch((err) => {
          logger.error('Failed to write audit activity log event', err);
        });
      }
      
      return originalSend.call(this, body);
    };

    next();
  };
};

export default logActivity;
