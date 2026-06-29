"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactFileService = void 0;
const contactFile_repository_1 = require("../repository/contactFile.repository");
const contactTimeline_service_1 = require("./contactTimeline.service");
exports.contactFileService = {
    getFiles: async (contactId, search) => {
        return contactFile_repository_1.contactFileRepository.findByContactId(contactId, search);
    },
    createFile: async (contactId, data, userId) => {
        const file = await contactFile_repository_1.contactFileRepository.create({
            contactId,
            name: data.name,
            path: data.path || `/uploads/${data.name}`,
            mimeType: data.mimeType || 'application/pdf',
            size: data.size || 1024 * 1024,
            createdBy: userId || null,
        });
        // Log to timeline
        await contactTimeline_service_1.contactTimelineService.logEvent({
            contactId,
            type: 'DOCUMENT_UPLOADED',
            title: 'Document Uploaded',
            description: `Uploaded document: "${data.name}"`,
            icon: 'FileText',
            color: '#10B981',
            createdBy: userId || 'system',
        });
        return file;
    },
    deleteFile: async (fileId, userId) => {
        const existing = await contactFile_repository_1.contactFileRepository.findById(fileId);
        if (!existing) {
            throw Object.assign(new Error('File not found'), { statusCode: 404 });
        }
        await contactFile_repository_1.contactFileRepository.softDelete(fileId, userId || null);
        // Log to timeline
        await contactTimeline_service_1.contactTimelineService.logEvent({
            contactId: existing.contactId,
            type: 'DOCUMENT_DELETED',
            title: 'Document Deleted',
            description: `Deleted document: "${existing.name}"`,
            icon: 'Trash2',
            color: '#EF4444',
            createdBy: userId || 'system',
        });
        return { success: true };
    }
};
exports.default = exports.contactFileService;
