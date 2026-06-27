"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateApiKey = void 0;
const db_1 = require("../database/db");
const response_1 = require("../helpers/response");
const logger_1 = require("./logger");
const validateApiKey = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) {
            res.status(401);
            response_1.ResponseHelper.sendError(req, res, 401, 'API key is missing in headers (x-api-key).');
            return;
        }
        // Query active keys
        const dbKey = await db_1.prisma.apiKey.findUnique({
            where: { key: apiKey },
            include: { user: { include: { role: true } } }
        });
        if (!dbKey || !dbKey.isActive || (dbKey.expiresAt && dbKey.expiresAt < new Date())) {
            res.status(401);
            response_1.ResponseHelper.sendError(req, res, 401, 'Invalid or expired API key.');
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
    }
    catch (error) {
        logger_1.logger.error('API key validation error', { error: error.message });
        res.status(500);
        response_1.ResponseHelper.sendError(req, res, 500, 'API key verification encountered an internal error.');
    }
};
exports.validateApiKey = validateApiKey;
exports.default = exports.validateApiKey;
