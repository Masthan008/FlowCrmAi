"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyFileService = void 0;
const companyFile_repository_1 = require("../repository/companyFile.repository");
const companyTimeline_service_1 = require("./companyTimeline.service");
const config_1 = require("../../config");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
exports.companyFileService = {
    getFiles: async (companyId) => {
        return companyFile_repository_1.companyFileRepository.findByCompanyId(companyId);
    },
    getStorageSummary: async (companyId) => {
        return companyFile_repository_1.companyFileRepository.getStorageSummary(companyId);
    },
    createFile: async (companyId, fileData, userId) => {
        const file = await companyFile_repository_1.companyFileRepository.create({
            companyId,
            name: fileData.originalname,
            path: fileData.filename,
            mimeType: fileData.mimetype,
            size: fileData.size,
            createdBy: userId || null,
        });
        await companyTimeline_service_1.companyTimelineService.logEvent({
            companyId,
            type: 'DOCUMENT_UPLOADED',
            title: 'Document Uploaded',
            description: `Uploaded file: "${fileData.originalname}" (${(fileData.size / 1024).toFixed(1)} KB)`,
            icon: 'Paperclip',
            color: '#10B981',
            createdBy: userId || 'system',
        });
        return file;
    },
    deleteFile: async (fileId, userId) => {
        const existing = await companyFile_repository_1.companyFileRepository.findById(fileId);
        if (!existing)
            throw Object.assign(new Error('File not found'), { statusCode: 404 });
        const result = await companyFile_repository_1.companyFileRepository.softDelete(fileId, userId || null);
        try {
            const filePath = path_1.default.join(config_1.config.uploadPath, existing.path);
            if (fs_1.default.existsSync(filePath))
                fs_1.default.unlinkSync(filePath);
        }
        catch (err) {
            console.error('Error deleting physical file from disk', err);
        }
        await companyTimeline_service_1.companyTimelineService.logEvent({
            companyId: existing.companyId,
            type: 'DOCUMENT_DELETED',
            title: 'Document Deleted',
            description: `Deleted file: "${existing.name}"`,
            icon: 'Trash2',
            color: '#EF4444',
            createdBy: userId || 'system',
        });
        return result;
    },
};
