"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Resolve directory path and load env variables
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
exports.config = {
    appName: process.env.APP_NAME || 'FlowCRM AI',
    appVersion: process.env.APP_VERSION || '1.0.0',
    port: parseInt(process.env.PORT || '5000', 10),
    env: process.env.NODE_ENV || 'development',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
    uploadPath: process.env.UPLOAD_PATH || path_1.default.join(__dirname, '../../uploads'),
    logLevel: process.env.LOG_LEVEL || 'info',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/flowcrm_db?schema=public',
    jwt: {
        secret: process.env.JWT_SECRET || 'default_jwt_access_secret_1294871924',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_jwt_refresh_secret_1294871924',
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    }
};
