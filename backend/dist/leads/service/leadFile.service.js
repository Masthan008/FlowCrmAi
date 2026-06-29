"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadFileService = void 0;
const leadFile_repository_1 = require("../repository/leadFile.repository");
const leadTimeline_service_1 = require("./leadTimeline.service");
const config_1 = require("../../config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.leadFileService = {
    getFiles: async (leadId) => {
        return leadFile_repository_1.leadFileRepository.findByLeadId(leadId);
    },
    getStorageSummary: async (leadId) => {
        return leadFile_repository_1.leadFileRepository.getStorageSummary(leadId);
    },
    createFile: async (leadId, fileData, userId) => {
        const file = await leadFile_repository_1.leadFileRepository.create({
            leadId,
            name: fileData.originalname,
            path: fileData.filename, // Multer unique disk filename
            mimeType: fileData.mimetype,
            size: fileData.size,
            createdBy: userId || null,
        });
        // Log to timeline
        await leadTimeline_service_1.leadTimelineService.logEvent({
            leadId,
            type: 'FILE_UPLOADED',
            title: 'File Uploaded',
            description: `Uploaded file: "${fileData.originalname}" (${(fileData.size / 1024).toFixed(1)} KB)`,
            icon: 'Paperclip',
            color: '#10B981',
            createdBy: userId || 'system',
        });
        return file;
    },
    deleteFile: async (fileId, userId) => {
        const existing = await leadFile_repository_1.leadFileRepository.findById(fileId);
        if (!existing) {
            throw Object.assign(new Error('File not found'), { statusCode: 404 });
        }
        // Soft delete in DB
        const result = await leadFile_repository_1.leadFileRepository.softDelete(fileId, userId || null);
        // Physically delete from disk if it exists
        try {
            const filePath = path_1.default.join(config_1.config.uploadPath, existing.path);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        catch (err) {
            console.error('Error deleting physical file from disk', err);
        }
        // Log to timeline
        await leadTimeline_service_1.leadTimelineService.logEvent({
            leadId: existing.leadId,
            type: 'FILE_DELETED',
            title: 'File Deleted',
            description: `Deleted file: "${existing.name}"`,
            icon: 'Trash2',
            color: '#EF4444',
            createdBy: userId || 'system',
        });
        return result;
    }
};
exports.default = exports.leadFileService;
