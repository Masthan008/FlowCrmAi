"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = exports.LocalStorageService = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const logger_1 = require("../middlewares/logger");
class LocalStorageService {
    uploadDir;
    constructor() {
        this.uploadDir = config_1.config.uploadPath;
        if (!fs_1.default.existsSync(this.uploadDir)) {
            fs_1.default.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    async saveFile(fileBuffer, fileName, mimeType) {
        const uniqueName = `${Date.now()}-${fileName}`;
        const destination = path_1.default.join(this.uploadDir, uniqueName);
        await fs_1.default.promises.writeFile(destination, fileBuffer);
        logger_1.logger.info(`File stored locally: ${uniqueName}`);
        return uniqueName; // Key of the stored file
    }
    async deleteFile(fileKey) {
        const filePath = path_1.default.join(this.uploadDir, fileKey);
        try {
            if (fs_1.default.existsSync(filePath)) {
                await fs_1.default.promises.unlink(filePath);
                logger_1.logger.info(`File deleted locally: ${fileKey}`);
                return true;
            }
            return false;
        }
        catch (error) {
            logger_1.logger.error(`Failed to delete local file: ${fileKey}`, error);
            return false;
        }
    }
    async getFileUrl(fileKey) {
        // Return relative URL for static loading
        return `/uploads/${fileKey}`;
    }
}
exports.LocalStorageService = LocalStorageService;
// Export default service instance
exports.storageService = new LocalStorageService();
exports.default = exports.storageService;
