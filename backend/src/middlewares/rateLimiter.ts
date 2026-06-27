import rateLimit from 'express-rate-limit';
import { ResponseHelper } from '../helpers/response';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(429);
    ResponseHelper.sendError(
      req,
      res,
      429,
      'Too many requests from this IP. Please try again in 15 minutes.'
    );
  }
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 10, // Limit each IP to 10 login/refresh attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(429);
    ResponseHelper.sendError(
      req,
      res,
      429,
      'Too many authentication requests. Please try again in 15 minutes.'
    );
  }
});
