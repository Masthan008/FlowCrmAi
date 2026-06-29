"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactNoteController = void 0;
const contactNote_service_1 = require("../service/contactNote.service");
const response_1 = require("../../helpers/response");
exports.contactNoteController = {
    list: async (req, res, next) => {
        try {
            const notes = await contactNote_service_1.contactNoteService.getNotes(req.params.id, req.query.search);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Notes retrieved successfully.', notes);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const note = await contactNote_service_1.contactNoteService.createNote(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Note created successfully.', note);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const note = await contactNote_service_1.contactNoteService.updateNote(req.params.noteId, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Note updated successfully.', note);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await contactNote_service_1.contactNoteService.deleteNote(req.params.noteId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Note deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    }
};
exports.default = exports.contactNoteController;
