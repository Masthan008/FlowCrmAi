"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyNoteService = void 0;
const companyNote_repository_1 = require("../repository/companyNote.repository");
const companyTimeline_service_1 = require("./companyTimeline.service");
exports.companyNoteService = {
    getNotes: async (companyId) => {
        return companyNote_repository_1.companyNoteRepository.findByCompanyId(companyId);
    },
    createNote: async (companyId, data, userId) => {
        const note = await companyNote_repository_1.companyNoteRepository.create({
            companyId,
            content: data.content,
            title: data.title || null,
            isPinned: data.isPinned || false,
            createdBy: userId || null,
        });
        await companyTimeline_service_1.companyTimelineService.logEvent({
            companyId,
            type: 'NOTE_ADDED',
            title: 'Note Added',
            description: data.title ? `Added note: "${data.title}"` : 'Added a new note',
            icon: 'FileText',
            color: '#F59E0B',
            createdBy: userId || 'system',
        });
        return note;
    },
    updateNote: async (noteId, data, userId) => {
        const existing = await companyNote_repository_1.companyNoteRepository.findById(noteId);
        if (!existing)
            throw Object.assign(new Error('Note not found'), { statusCode: 404 });
        return companyNote_repository_1.companyNoteRepository.update(noteId, {
            content: data.content,
            title: data.title || null,
            isPinned: data.isPinned !== undefined ? data.isPinned : existing.isPinned,
            updatedBy: userId || null,
        });
    },
    deleteNote: async (noteId, userId) => {
        const existing = await companyNote_repository_1.companyNoteRepository.findById(noteId);
        if (!existing)
            throw Object.assign(new Error('Note not found'), { statusCode: 404 });
        return companyNote_repository_1.companyNoteRepository.softDelete(noteId, userId || null);
    },
};
