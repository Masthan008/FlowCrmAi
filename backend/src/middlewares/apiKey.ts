import { Request, Response, NextFunction } from 'express';
import { prisma } from '../database/db';
import { ResponseHelper } from '../helpers/response';
import { logger } from './logger';

export const validateApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;
    
    if (!apiKey) {
      res.status(401);
      ResponseHelper.sendError(req, res, 401, 'API key is missing in headers (x-api-key).');
      return;
    }

    // Query active keys
    const dbKey = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: { include: { role: true } } }
    });

    if (!dbKey || !dbKey.isActive || (dbKey.expiresAt && dbKey.expiresAt < new Date())) {
      res.status(401);
      ResponseHelper.sendError(req, res, 401, 'Invalid or expired API key.');
      return;
    }

    // Populate user context
    req.user = {
      id: dbKey.user.id,
      email: dbKey.user.email,
      role: dbKey.user.role.name,
      permissions: [], // Permissions can load from DB or leave empty for API keys
    };

    next();
  } catch (error: any) {
    logger.error('API key validation error', { error: error.message });
    res.status(500);
    ResponseHelper.sendError(req, res, 500, 'API key verification encountered an internal error.');
  }
};
export default validateApiKey;
