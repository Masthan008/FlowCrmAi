"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadNoteController = void 0;
const leadNote_service_1 = require("../service/leadNote.service");
const response_1 = require("../../helpers/response");
exports.leadNoteController = {
    list: async (req, res, next) => {
        try {
            const notes = await leadNote_service_1.leadNoteService.getNotes(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Notes retrieved successfully.', notes);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const note = await leadNote_service_1.leadNoteService.createNote(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Note created successfully.', note);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const note = await leadNote_service_1.leadNoteService.updateNote(req.params.noteId, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Note updated successfully.', note);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await leadNote_service_1.leadNoteService.deleteNote(req.params.noteId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Note deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    }
};
exports.default = exports.leadNoteController;
