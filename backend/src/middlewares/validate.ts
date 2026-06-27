import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ResponseHelper } from '../helpers/response';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate body, query, and params as defined in schema
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as any;
      
      // Re-assign validated properties back to the request
      req.body = parsed.body;
      req.query = parsed.query;
      req.params = parsed.params;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorsList = error.issues.map((issue) => ({
          field: issue.path.slice(1).join('.'), // Remove 'body', 'query', or 'params' root label
          message: issue.message,
        }));
        
        res.status(400);
        ResponseHelper.sendError(req, res, 400, 'Request validation failed', errorsList);
        return;
      }
      next(error);
    }
  };
};
export default validateRequest;
