"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealWorkspaceService = void 0;
const dealWorkspace_repository_1 = require("../repository/dealWorkspace.repository");
const deal_repository_1 = require("../repository/deal.repository");
exports.dealWorkspaceService = {
    // PROFILE DETAILS
    getProfile: async (dealId) => {
        const deal = await deal_repository_1.dealRepository.findByIdWithRelations(dealId);
        if (!deal) {
            throw { statusCode: 404, message: 'Deal opportunity not found.' };
        }
        return deal;
    },
    // TIMELINE
    getTimeline: async (dealId, search) => {
        return dealWorkspace_repository_1.dealWorkspaceRepository.findTimelineByDealId(dealId, search);
    },
    // NOTES
    getNotes: async (dealId, search) => {
        return dealWorkspace_repository_1.dealWorkspaceRepository.findNotesByDealId(dealId, search);
    },
    createNote: async (dealId, data) => {
        const note = await dealWorkspace_repository_1.dealWorkspaceRepository.createNote({ dealId, ...data });
        // Log timeline
        await dealWorkspace_repository_1.dealWorkspaceRepository.createTimelineEntry({
            dealId,
            type: 'NOTE_ADDED',
            title: 'New note compiled',
            description: data.content.substring(0, 100) + (data.content.length > 100 ? '...' : ''),
            icon: 'FileText',
            color: 'amber',
            createdBy: data.createdBy
        });
        // Log history
        await dealWorkspace_repository_1.dealWorkspaceRepository.createHistoryEntry({
            dealId,
            action: 'Note Added',
            fieldName: 'deal_notes',
            newValue: data.content.substring(0, 100),
            userId: note.id,
            createdBy: data.createdBy
        });
        return note;
    },
    updateNote: async (noteId, data) => {
        const existing = await dealWorkspace_repository_1.dealWorkspaceRepository.findNoteById(noteId);
        if (!existing)
            throw { statusCode: 404, message: 'Note not found.' };
        const updated = await dealWorkspace_repository_1.dealWorkspaceRepository.updateNote(noteId, data);
        // Log history
        await dealWorkspace_repository_1.dealWorkspaceRepository.createHistoryEntry({
            dealId: existing.dealId,
            action: 'Note Edited',
            fieldName: 'deal_notes',
            oldValue: existing.content.substring(0, 50),
            newValue: data.content?.substring(0, 50),
            userId: noteId,
            createdBy: data.updatedBy
        });
        return updated;
    },
    deleteNote: async (noteId, deletedBy) => {
        const existing = await dealWorkspace_repository_1.dealWorkspaceRepository.findNoteById(noteId);
        if (!existing)
            throw { statusCode: 404, message: 'Note not found.' };
        await dealWorkspace_repository_1.dealWorkspaceRepository.deleteNote(noteId, deletedBy);
        // Log history
        await dealWorkspace_repository_1.dealWorkspaceRepository.createHistoryEntry({
            dealId: existing.dealId,
            action: 'Note Deleted',
            fieldName: 'deal_notes',
            oldValue: existing.content.substring(0, 50),
            userId: noteId,
            createdBy: deletedBy
        });
    },
    // ACTIVITIES
    getActivities: async (dealId, filters) => {
        return dealWorkspace_repository_1.dealWorkspaceRepository.findActivitiesByDealId(dealId, filters);
    },
    createActivity: async (dealId, data, createdBy) => {
        const activity = await dealWorkspace_repository_1.dealWorkspaceRepository.createActivity({ ...data, dealId, createdBy });
        // Log timeline
        await dealWorkspace_repository_1.dealWorkspaceRepository.createTimelineEntry({
            dealId,
            type: 'ACTIVITY_CREATED',
            title: `Activity scheduled: ${data.title}`,
            description: data.description || `Type: ${data.type}`,
            icon: 'Calendar',
            color: 'indigo',
            createdBy
        });
        // Log history
        await dealWorkspace_repository_1.dealWorkspaceRepository.createHistoryEntry({
            dealId,
            action: 'Activity Created',
            fieldName: 'deal_activities',
            newValue: data.title,
            userId: activity.id,
            createdBy
        });
        return activity;
    },
    updateActivity: async (activityId, data, updatedBy) => {
        const existing = await dealWorkspace_repository_1.dealWorkspaceRepository.findActivityById(activityId);
        if (!existing)
            throw { statusCode: 404, message: 'Activity not found.' };
        const updated = await dealWorkspace_repository_1.dealWorkspaceRepository.updateActivity(activityId, { ...data, updatedBy });
        // Log history
        await dealWorkspace_repository_1.dealWorkspaceRepository.createHistoryEntry({
            dealId: existing.dealId,
            action: 'Activity Updated',
            fieldName: 'deal_activities',
            oldValue: existing.title,
            newValue: data.title,
            userId: activityId,
            createdBy: updatedBy
        });
        return updated;
    },
    deleteActivity: async (activityId, deletedBy) => {
        const existing = await dealWorkspace_repository_1.dealWorkspaceRepository.findActivityById(activityId);
        if (!existing)
            throw { statusCode: 404, message: 'Activity not found.' };
        await dealWorkspace_repository_1.dealWorkspaceRepository.deleteActivity(activityId, deletedBy);
        // Log history
        await dealWorkspace_repository_1.dealWorkspaceRepository.createHistoryEntry({
            dealId: existing.dealId,
            action: 'Activity Deleted',
            fieldName: 'deal_activities',
            oldValue: existing.title,
            userId: activityId,
            createdBy: deletedBy
        });
    },
    // FILES
    getFiles: async (dealId, search) => {
        return dealWorkspace_repository_1.dealWorkspaceRepository.findFilesByDealId(dealId, search);
    },
    createFile: async (dealId, fileData, createdBy) => {
        const file = await dealWorkspace_repository_1.dealWorkspaceRepository.createFile({ dealId, ...fileData, createdBy });
        // Log timeline
        await dealWorkspace_repository_1.dealWorkspaceRepository.createTimelineEntry({
            dealId,
            type: 'FILE_UPLOADED',
            title: `File attached: ${fileData.name}`,
            description: `Format: ${fileData.mimeType} (${Math.round(fileData.size / 1024)} KB)`,
            icon: 'Paperclip',
            color: 'blue',
            createdBy
        });
        // Log history
        await dealWorkspace_repository_1.dealWorkspaceRepository.createHistoryEntry({
            dealId,
            action: 'File Attached',
            fieldName: 'deal_files',
            newValue: fileData.name,
            userId: file.id,
            createdBy
        });
        return file;
    },
    deleteFile: async (fileId, deletedBy) => {
        const existing = await dealWorkspace_repository_1.dealWorkspaceRepository.findFileById(fileId);
        if (!existing)
            throw { statusCode: 404, message: 'Attachment not found.' };
        await dealWorkspace_repository_1.dealWorkspaceRepository.deleteFile(fileId, deletedBy);
        // Log history
        await dealWorkspace_repository_1.dealWorkspaceRepository.createHistoryEntry({
            dealId: existing.dealId,
            action: 'File Detached',
            fieldName: 'deal_files',
            oldValue: existing.name,
            userId: fileId,
            createdBy: deletedBy
        });
    },
    // HISTORY
    getHistory: async (dealId, search) => {
        return dealWorkspace_repository_1.dealWorkspaceRepository.findHistoryByDealId(dealId, search);
    },
    // PRODUCTS
    getProducts: async (dealId, search) => {
        return dealWorkspace_repository_1.dealWorkspaceRepository.findProductsByDealId(dealId, search);
    },
    // QUOTES
    getQuotes: async (dealId, search) => {
        return dealWorkspace_repository_1.dealWorkspaceRepository.findQuotesByDealId(dealId, search);
    },
};
