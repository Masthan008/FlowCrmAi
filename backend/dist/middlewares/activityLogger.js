"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = void 0;
const auditLog_repository_1 = require("../repositories/auditLog.repository");
const logger_1 = require("./logger");
const logActivity = (moduleName, actionName) => {
    return async (req, res, next) => {
        // Intercept standard response to log only on success
        const originalSend = res.send;
        res.send = function (body) {
            res.send = originalSend; // restore send method
            // Perform logging asynchronously after response completes
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const ipAddress = req.ip || req.socket.remoteAddress;
                const browser = req.headers['user-agent'];
                const userId = req.user?.id;
                auditLog_repository_1.auditLogRepository.logEvent({
                    userId,
                    action: actionName,
                    module: moduleName,
                    ipAddress,
                    browser,
                    details: {
                        method: req.method,
                        url: req.originalUrl,
                        params: req.params,
                        query: req.query,
                    },
                    createdBy: userId || 'system',
                }).catch((err) => {
                    logger_1.logger.error('Failed to write audit activity log event', err);
                });
            }
            return originalSend.call(this, body);
        };
        next();
    };
};
exports.logActivity = logActivity;
exports.default = exports.logActivity;
