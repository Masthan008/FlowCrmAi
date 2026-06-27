import dotenv from 'dotenv';
import path from 'path';

// Resolve directory path and load env variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  appName: process.env.APP_NAME || 'FlowCRM AI',
  appVersion: process.env.APP_VERSION || '1.0.0',
  port: parseInt(process.env.PORT || '5000', 10),
  env: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  uploadPath: process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads'),
  logLevel: process.env.LOG_LEVEL || 'info',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/flowcrm_db?schema=public',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_access_secret_1294871924',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_jwt_refresh_secret_1294871924',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  }
};
