"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const response_1 = require("../helpers/response");
const logger_1 = require("./logger");
const client_1 = require("@prisma/client");
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = null;
    // Log error using Winston
    logger_1.logger.error('API Error Occurred', {
        method: req.method,
        url: req.originalUrl,
        statusCode,
        message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        requestId: req.requestId,
    });
    // Handle Prisma Database Errors
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation (P2002)
        if (err.code === 'P2002') {
            const targetField = err.meta?.target?.join(', ') || 'field';
            res.status(409);
            return response_1.ResponseHelper.sendError(req, res, 409, `A record with this ${targetField} already exists.`, {
                code: 'UNIQUE_CONSTRAINT_VIOLATION',
                meta: err.meta,
            });
        }
        // Record not found (P2025)
        if (err.code === 'P2025') {
            res.status(404);
            return response_1.ResponseHelper.sendError(req, res, 404, 'Requested record was not found.', {
                code: 'RECORD_NOT_FOUND',
            });
        }
        // Foreign key constraint violation (P2003)
        if (err.code === 'P2003') {
            res.status(400);
            return response_1.ResponseHelper.sendError(req, res, 400, 'Foreign key constraint failed. Related record does not exist.', {
                code: 'FOREIGN_KEY_VIOLATION',
                meta: err.meta,
            });
        }
        // Generic fallback for other Prisma Errors
        res.status(400);
        return response_1.ResponseHelper.sendError(req, res, 400, 'Database operation failed.', {
            code: err.code,
            meta: err.meta,
        });
    }
    // Handle JWT Auth Errors
    if (err.name === 'TokenExpiredError') {
        res.status(401);
        return response_1.ResponseHelper.sendError(req, res, 401, 'Authentication token has expired. Please log in again.', {
            code: 'TOKEN_EXPIRED',
        });
    }
    if (err.name === 'JsonWebTokenError') {
        res.status(401);
        return response_1.ResponseHelper.sendError(req, res, 401, 'Invalid authentication token.', {
            code: 'INVALID_TOKEN',
        });
    }
    // Send standard formatted error
    return response_1.ResponseHelper.sendError(req, res, statusCode, message, errors);
};
exports.errorHandler = errorHandler;
exports.default = exports.errorHandler;
