"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = exports.logger = void 0;
const morgan_1 = __importDefault(require("morgan"));
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const logDirectory = path_1.default.join(__dirname, '../../logs');
// System logging format
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json());
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: 'HH:mm:ss' }), winston_1.default.format.printf(({ timestamp, level, message, requestId }) => {
    const reqIdStr = requestId ? ` [Req ID: ${requestId}]` : '';
    return `[${timestamp}] ${level}:${reqIdStr} ${message}`;
}));
// Create logger instance
exports.logger = winston_1.default.createLogger({
    level: config_1.config.logLevel,
    format: logFormat,
    transports: [
        // Console log transport
        new winston_1.default.transports.Console({
            format: consoleFormat,
        }),
        // Combined log daily rotation file transport
        new winston_daily_rotate_file_1.default({
            filename: path_1.default.join(logDirectory, 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            level: 'info',
        }),
        // Error log daily rotation file transport
        new winston_daily_rotate_file_1.default({
            filename: path_1.default.join(logDirectory, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d',
            level: 'error',
        }),
    ],
});
// Configure Morgan request logger
exports.requestLogger = (0, morgan_1.default)(':method :url :status :res[content-length] - :response-time ms', {
    stream: {
        write: (message) => {
            exports.logger.info(message.trim());
        },
    },
});
exports.default = exports.logger;
