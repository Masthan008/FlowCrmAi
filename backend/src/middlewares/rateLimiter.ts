import rateLimit from 'express-rate-limit';
import { ResponseHelper } from '../helpers/response';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: process.env.NODE_ENV === 'production' ? 5000 : 50000, // Limit each IP to 50000 requests in dev
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
  max: process.env.NODE_ENV === 'production' ? 500 : 5000, // Limit each IP to 5000 login/refresh attempts in dev
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
