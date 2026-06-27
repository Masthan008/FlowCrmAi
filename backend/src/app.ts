import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { requestIdMiddleware } from './middlewares/requestId';
import { requestLogger } from './middlewares/logger';
import { errorHandler } from './middlewares/errorHandler';
import { apiRateLimiter } from './middlewares/rateLimiter';
import apiV1Router from './routes/v1';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // Allow all cross-origins for this foundation phase
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Performance & parsing middlewares
app.use(compression());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inject Request tracking identifiers
app.use(requestIdMiddleware);

// Request logger middleware
app.use(requestLogger);

// Rate limiter on api namespace
app.use('/api', apiRateLimiter);

// Mount API versioned routes
app.use('/api/v1', apiV1Router);

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Cannot ${req.method} ${req.originalUrl} - Route not found`,
    timestamp: new Date().toISOString(),
    requestId: req.requestId || 'unknown'
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
