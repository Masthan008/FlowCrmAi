"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.prisma = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../middlewares/logger");
// Create a singleton instance of PrismaClient
exports.prisma = new client_1.PrismaClient({
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
