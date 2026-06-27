"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const db_1 = require("./database/db");
const logger_1 = require("./middlewares/logger");
const server = app_1.default.listen(config_1.config.port, async () => {
    logger_1.logger.info(`=========================================`);
    logger_1.logger.info(`FlowCRM AI Enterprise Backend Initialized`);
    logger_1.logger.info(`Port: ${config_1.config.port}`);
    logger_1.logger.info(`Environment: ${config_1.config.env}`);
    logger_1.logger.info(`=========================================`);
    // Verify connection pool integrity
    const connected = await db_1.db.checkConnection();
    if (connected) {
        logger_1.logger.info('PostgreSQL connection client pool initialized and active.');
    }
    else {
        logger_1.logger.error('CRITICAL: Failed to establish database connection during boot.');
    }
});
// Process exception listeners for safety
process.on('unhandledRejection', (err) => {
    logger_1.logger.error('Unhandled Promise Rejection! Shutting down server...', err);
    server.close(() => {
        db_1.prisma.$disconnect().then(() => {
            process.exit(1);
        });
    });
});
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received. Cleaning database connections and shutting down gracefully...');
    server.close(() => {
        db_1.prisma.$disconnect().then(() => {
            logger_1.logger.info('Process terminated safely.');
            process.exit(0);
        });
    });
});
