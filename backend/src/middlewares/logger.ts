import morgan from 'morgan';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { config } from '../config';

const logDirectory = path.join(__dirname, '../../logs');

// System logging format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, requestId }) => {
    const reqIdStr = requestId ? ` [Req ID: ${requestId}]` : '';
    return `[${timestamp}] ${level}:${reqIdStr} ${message}`;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: config.logLevel,
  format: logFormat,
  transports: [
    // Console log transport
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // Combined log daily rotation file transport
    new DailyRotateFile({
      filename: path.join(logDirectory, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
    }),
    // Error log daily rotation file transport
    new DailyRotateFile({
      filename: path.join(logDirectory, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
    }),
  ],
});

// Configure Morgan request logger
export const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      },
    },
  }
);
export default logger;
