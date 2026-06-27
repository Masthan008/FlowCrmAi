import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { logger } from '../middlewares/logger';

export interface IStorageService {
  saveFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string>;
  deleteFile(fileKey: string): Promise<boolean>;
  getFileUrl(fileKey: string): Promise<string>;
}

export class LocalStorageService implements IStorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = config.uploadPath;
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    const uniqueName = `${Date.now()}-${fileName}`;
    const destination = path.join(this.uploadDir, uniqueName);
    
    await fs.promises.writeFile(destination, fileBuffer);
    logger.info(`File stored locally: ${uniqueName}`);
    
    return uniqueName; // Key of the stored file
  }

  async deleteFile(fileKey: string): Promise<boolean> {
    const filePath = path.join(this.uploadDir, fileKey);
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
        logger.info(`File deleted locally: ${fileKey}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error(`Failed to delete local file: ${fileKey}`, error);
      return false;
    }
  }

  async getFileUrl(fileKey: string): Promise<string> {
    // Return relative URL for static loading
    return `/uploads/${fileKey}`;
  }
}

// Export default service instance
export const storageService = new LocalStorageService();
export default storageService;
