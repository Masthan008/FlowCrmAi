"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseHelper = void 0;
exports.ResponseHelper = {
    /**
     * Send a successful JSON API response
     */
    sendSuccess: (req, res, statusCode, message, data = null, pagination = null) => {
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
    sendError: (req, res, statusCode, message, errors = null) => {
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
