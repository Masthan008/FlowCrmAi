"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTimeframe = void 0;
const response_1 = require("../../helpers/response");
/**
 * Validates the global timeframe filter query
 */
const validateTimeframe = (req, res, next) => {
    const timeframe = req.query.timeframe || '30d';
    const allowed = ['today', 'yesterday', '7d', '30d', 'quarter', 'year', 'custom'];
    if (!allowed.includes(timeframe.toLowerCase())) {
        return response_1.ResponseHelper.sendError(res, 400, `Invalid filter timeframe: '${timeframe}'. Allowed: ${allowed.join(', ')}`);
    }
    next();
};
exports.validateTimeframe = validateTimeframe;
exports.default = exports.validateTimeframe;
