"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactNoteService = void 0;
const contactNote_repository_1 = require("../repository/contactNote.repository");
const contactTimeline_service_1 = require("./contactTimeline.service");
exports.contactNoteService = {
    getNotes: async (contactId, search) => {
        return contactNote_repository_1.contactNoteRepository.findByContactId(contactId, search);
    },
    createNote: async (contactId, data, userId) => {
        const note = await contactNote_repository_1.contactNoteRepository.create({
            contactId,
            content: data.content,
            title: data.title || null,
            isPinned: data.isPinned || false,
            createdBy: userId || null,
        });
        // Log to timeline
        await contactTimeline_service_1.contactTimelineService.logEvent({
            contactId,
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
        const existing = await contactNote_repository_1.contactNoteRepository.findById(noteId);
        if (!existing) {
            throw Object.assign(new Error('Note not found'), { statusCode: 404 });
        }
        return contactNote_repository_1.contactNoteRepository.update(noteId, {
            content: data.content,
            title: data.title || null,
            isPinned: data.isPinned !== undefined ? data.isPinned : existing.isPinned,
            updatedBy: userId || null,
        });
    },
    deleteNote: async (noteId, userId) => {
        const existing = await contactNote_repository_1.contactNoteRepository.findById(noteId);
        if (!existing) {
            throw Object.assign(new Error('Note not found'), { statusCode: 404 });
        }
        await contactNote_repository_1.contactNoteRepository.softDelete(noteId, userId || null);
        // Log to timeline
        await contactTimeline_service_1.contactTimelineService.logEvent({
            contactId: existing.contactId,
            type: 'NOTE_DELETED',
            title: 'Note Deleted',
            description: existing.title ? `Deleted note: "${existing.title}"` : 'Deleted a note',
            icon: 'Trash2',
            color: '#EF4444',
            createdBy: userId || 'system',
        });
        return { success: true };
    }
};
exports.default = exports.contactNoteService;
