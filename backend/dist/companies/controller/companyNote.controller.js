"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyNoteController = void 0;
const companyNote_service_1 = require("../service/companyNote.service");
const response_1 = require("../../helpers/response");
exports.companyNoteController = {
    list: async (req, res, next) => {
        try {
            const notes = await companyNote_service_1.companyNoteService.getNotes(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Notes retrieved successfully.', notes);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const note = await companyNote_service_1.companyNoteService.createNote(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Note created successfully.', note);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const note = await companyNote_service_1.companyNoteService.updateNote(req.params.noteId, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Note updated successfully.', note);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await companyNote_service_1.companyNoteService.deleteNote(req.params.noteId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Note deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
};
