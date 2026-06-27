import app from './app';
import { config } from './config';
import { db, prisma } from './database/db';
import { logger } from './middlewares/logger';

const server = app.listen(config.port, async () => {
  logger.info(`=========================================`);
  logger.info(`FlowCRM AI Enterprise Backend Initialized`);
  logger.info(`Port: ${config.port}`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`=========================================`);

  // Verify connection pool integrity
  const connected = await db.checkConnection();
  if (connected) {
    logger.info('PostgreSQL connection client pool initialized and active.');
  } else {
    logger.error('CRITICAL: Failed to establish database connection during boot.');
  }
});

// Process exception listeners for safety
process.on('unhandledRejection', (err: any) => {
  logger.error('Unhandled Promise Rejection! Shutting down server...', err);
  server.close(() => {
    prisma.$disconnect().then(() => {
      process.exit(1);
    });
  });
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Cleaning database connections and shutting down gracefully...');
  server.close(() => {
    prisma.$disconnect().then(() => {
      logger.info('Process terminated safely.');
      process.exit(0);
    });
  });
});
