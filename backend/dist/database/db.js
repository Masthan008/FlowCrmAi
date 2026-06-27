"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.prisma = exports.pool = void 0;
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = __importDefault(require("pg"));
const logger_1 = require("../middlewares/logger");
const config_1 = require("../config");
// Initialize direct pg Pool connection client
exports.pool = new pg_1.default.Pool({
    connectionString: config_1.config.databaseUrl,
});
const adapter = new adapter_pg_1.PrismaPg(exports.pool);
// Create a singleton instance of PrismaClient using pg Driver Adapter
exports.prisma = new client_1.PrismaClient({
    adapter,
    log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
    ],
});
// Pipe Prisma query logs to Winston debug
exports.prisma.$on('query', (e) => {
    logger_1.logger.debug(`Prisma Query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`);
});
// Pipe Prisma info logs to Winston info
exports.prisma.$on('info', (e) => {
    logger_1.logger.info(`Prisma Info: ${e.message}`);
});
// Pipe Prisma warnings to Winston warn
exports.prisma.$on('warn', (e) => {
    logger_1.logger.warn(`Prisma Warning: ${e.message}`);
});
// Pipe Prisma errors to Winston error
exports.prisma.$on('error', (e) => {
    logger_1.logger.error(`Prisma Error: ${e.message}`);
});
exports.db = {
    /**
     * Healthcheck function to verify database connectivity
     */
    checkConnection: async () => {
        try {
            await exports.prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch (error) {
            logger_1.logger.error('Prisma database connection healthcheck failed', error);
            return false;
        }
    }
};
exports.default = exports.prisma;
