"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadNoteService = void 0;
const leadNote_repository_1 = require("../repository/leadNote.repository");
const leadTimeline_service_1 = require("./leadTimeline.service");
exports.leadNoteService = {
    getNotes: async (leadId) => {
        return leadNote_repository_1.leadNoteRepository.findByLeadId(leadId);
    },
    createNote: async (leadId, data, userId) => {
        const note = await leadNote_repository_1.leadNoteRepository.create({
            leadId,
            content: data.content,
            title: data.title || null,
            isPinned: data.isPinned || false,
            createdBy: userId || null,
        });
        // Log to timeline
        await leadTimeline_service_1.leadTimelineService.logEvent({
            leadId,
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
        const existing = await leadNote_repository_1.leadNoteRepository.findById(noteId);
        if (!existing) {
            throw Object.assign(new Error('Note not found'), { statusCode: 404 });
        }
        return leadNote_repository_1.leadNoteRepository.update(noteId, {
            content: data.content,
            title: data.title || null,
            isPinned: data.isPinned !== undefined ? data.isPinned : existing.isPinned,
            updatedBy: userId || null,
        });
    },
    deleteNote: async (noteId, userId) => {
        const existing = await leadNote_repository_1.leadNoteRepository.findById(noteId);
        if (!existing) {
            throw Object.assign(new Error('Note not found'), { statusCode: 404 });
        }
        return leadNote_repository_1.leadNoteRepository.softDelete(noteId, userId || null);
    }
};
exports.default = exports.leadNoteService;
