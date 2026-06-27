import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { logger } from '../middlewares/logger';
import { config } from '../config';

// Initialize direct pg Pool connection client
export const pool = new pg.Pool({
  connectionString: config.databaseUrl,
});

const adapter = new PrismaPg(pool);

// Create a singleton instance of PrismaClient using pg Driver Adapter
export const prisma = new PrismaClient({
  adapter,
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
    { emit: 'event', level: 'error' },
  ],
});

// Pipe Prisma query logs to Winston debug
prisma.$on('query' as any, (e: any) => {
  logger.debug(`Prisma Query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`);
});

// Pipe Prisma info logs to Winston info
prisma.$on('info' as any, (e: any) => {
  logger.info(`Prisma Info: ${e.message}`);
});

// Pipe Prisma warnings to Winston warn
prisma.$on('warn' as any, (e: any) => {
  logger.warn(`Prisma Warning: ${e.message}`);
});

// Pipe Prisma errors to Winston error
prisma.$on('error' as any, (e: any) => {
  logger.error(`Prisma Error: ${e.message}`);
});

export const db = {
  /**
   * Healthcheck function to verify database connectivity
   */
  checkConnection: async (): Promise<boolean> => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Prisma database connection healthcheck failed', error);
      return false;
    }
  }
};
export default prisma;
