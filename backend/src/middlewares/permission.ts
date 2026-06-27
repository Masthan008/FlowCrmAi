import { Request, Response, NextFunction } from 'express';
import { ResponseHelper } from '../helpers/response';

/**
 * Match dynamic/wildcard permissions (e.g. 'leads:*' matches 'leads:create')
 */
const hasPermissionMatch = (userPermissions: string[], requiredPermission: string): boolean => {
  // If user has direct exact permission
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }

  // If user has super admin permission wildcard
  if (userPermissions.includes('*')) {
    return true;
  }

  // Support category wildcard (e.g., user has 'leads:*', checks 'leads:create')
  const requiredParts = requiredPermission.split(':');
  if (requiredParts.length > 1) {
    const wildcardPattern = `${requiredParts[0]}:*`;
    if (userPermissions.includes(wildcardPattern)) {
      return true;
    }
  }

  return false;
};

/**
 * Middleware to enforce required dynamic permissions
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401);
      ResponseHelper.sendError(req, res, 401, 'User context not found. Authentication is required.');
      return;
    }

    const hasAccess = hasPermissionMatch(req.user.permissions, permission);
    if (!hasAccess) {
      res.status(403);
      ResponseHelper.sendError(
        req,
        res,
        403,
        `Access denied. You do not possess the required permission: '${permission}'`
      );
      return;
    }

    next();
  };
};

export default requirePermission;
