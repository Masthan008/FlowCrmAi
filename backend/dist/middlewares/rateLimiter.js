"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRateLimiter = exports.apiRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const response_1 = require("../helpers/response");
exports.apiRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: process.env.NODE_ENV === 'production' ? 100 : 10000, // Limit each IP to 10000 requests in dev
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        res.status(429);
        response_1.ResponseHelper.sendError(req, res, 429, 'Too many requests from this IP. Please try again in 15 minutes.');
    }
});
exports.authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: process.env.NODE_ENV === 'production' ? 10 : 1000, // Limit each IP to 1000 login/refresh attempts in dev
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        res.status(429);
        response_1.ResponseHelper.sendError(req, res, 429, 'Too many authentication requests. Please try again in 15 minutes.');
    }
});
