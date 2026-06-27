"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
const jwt_1 = require("../utils/jwt");
const response_1 = require("../helpers/response");
const logger_1 = require("./logger");
/**
 * Middleware to enforce authentication on routes
 */
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401);
            response_1.ResponseHelper.sendError(req, res, 401, 'Authentication token is missing. Please log in.');
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401);
            response_1.ResponseHelper.sendError(req, res, 401, 'Authentication token is empty.');
            return;
        }
        // Decode and verify claims
        const decoded = jwt_1.JwtUtility.verifyAccessToken(token);
        // Attach claims to Request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            permissions: decoded.permissions || []
        };
        next();
    }
    catch (error) {
        logger_1.logger.error('Authentication check failed', { error: error.message });
        res.status(401);
        if (error.name === 'TokenExpiredError') {
            response_1.ResponseHelper.sendError(req, res, 401, 'Your session has expired. Please log in again.', { code: 'TOKEN_EXPIRED' });
            return;
        }
        response_1.ResponseHelper.sendError(req, res, 401, 'Invalid authentication token. Please log in again.', { code: 'INVALID_TOKEN' });
    }
};
exports.requireAuth = requireAuth;
/**
 * Middleware to enforce roles mapping
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401);
            response_1.ResponseHelper.sendError(req, res, 401, 'User context not found. Authentication is required.');
            return;
        }
        const hasRole = allowedRoles.includes(req.user.role);
        if (!hasRole) {
            res.status(403);
            response_1.ResponseHelper.sendError(req, res, 403, `Access denied. Role '${req.user.role}' is unauthorized to perform this action.`);
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
