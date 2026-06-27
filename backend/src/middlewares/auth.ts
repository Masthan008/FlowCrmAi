import { Request, Response, NextFunction } from 'express';
import { JwtUtility } from '../utils/jwt';
import { ResponseHelper } from '../helpers/response';
import { logger } from './logger';

/**
 * Middleware to enforce authentication on routes
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401);
      ResponseHelper.sendError(req, res, 401, 'Authentication token is missing. Please log in.');
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401);
      ResponseHelper.sendError(req, res, 401, 'Authentication token is empty.');
      return;
    }

    // Decode and verify claims
    const decoded = JwtUtility.verifyAccessToken(token);
    
    // Attach claims to Request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      permissions: decoded.permissions || []
    };

    next();
  } catch (error: any) {
    logger.error('Authentication check failed', { error: error.message });
    res.status(401);
    
    if (error.name === 'TokenExpiredError') {
      ResponseHelper.sendError(req, res, 401, 'Your session has expired. Please log in again.', { code: 'TOKEN_EXPIRED' });
      return;
    }
    ResponseHelper.sendError(req, res, 401, 'Invalid authentication token. Please log in again.', { code: 'INVALID_TOKEN' });
  }
};

/**
 * Middleware to enforce roles mapping
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401);
      ResponseHelper.sendError(req, res, 401, 'User context not found. Authentication is required.');
      return;
    }

    const hasRole = allowedRoles.includes(req.user.role);
    if (!hasRole) {
      res.status(403);
      ResponseHelper.sendError(req, res, 403, `Access denied. Role '${req.user.role}' is unauthorized to perform this action.`);
      return;
    }

    next();
  };
};
