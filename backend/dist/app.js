"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const requestId_1 = require("./middlewares/requestId");
const logger_1 = require("./middlewares/logger");
const errorHandler_1 = require("./middlewares/errorHandler");
const rateLimiter_1 = require("./middlewares/rateLimiter");
const v1_1 = __importDefault(require("./routes/v1"));
const app = (0, express_1.default)();
// Trust reverse proxy (Nginx)
app.set('trust proxy', 1);
// Security Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '*', // Allow all cross-origins for this foundation phase
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));
// Performance & parsing middlewares
app.use((0, compression_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Inject Request tracking identifiers
app.use(requestId_1.requestIdMiddleware);
// Request logger middleware
app.use(logger_1.requestLogger);
// Rate limiter on api namespace
app.use('/api', rateLimiter_1.apiRateLimiter);
// Serve file uploads statically
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
app.use('/uploads', express_1.default.static(path_1.default.resolve(config_1.config.uploadPath)));
// Mount API versioned routes
app.use('/api/v1', v1_1.default);
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
app.use(errorHandler_1.errorHandler);
exports.default = app;
