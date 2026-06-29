"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealWorkspaceController = void 0;
const dealWorkspace_service_1 = require("../service/dealWorkspace.service");
const response_1 = require("../../helpers/response");
exports.dealWorkspaceController = {
    getProfile: async (req, res, next) => {
        try {
            const data = await dealWorkspace_service_1.dealWorkspaceService.getProfile(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal profile loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    getTimeline: async (req, res, next) => {
        try {
            const data = await dealWorkspace_service_1.dealWorkspaceService.getTimeline(req.params.id, req.query.search);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal timeline loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    getNotes: async (req, res, next) => {
        try {
            const data = await dealWorkspace_service_1.dealWorkspaceService.getNotes(req.params.id, req.query.search);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal notes loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    createNote: async (req, res, next) => {
        try {
            const note = await dealWorkspace_service_1.dealWorkspaceService.createNote(req.params.id, {
                title: req.body.title,
                content: req.body.content,
                createdBy: (req.user?.email || 'system')
            });
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Deal note created successfully.', note);
        }
        catch (error) {
            next(error);
        }
    },
    updateNote: async (req, res, next) => {
        try {
            const note = await dealWorkspace_service_1.dealWorkspaceService.updateNote(req.params.noteId, {
                title: req.body.title,
                content: req.body.content,
                isPinned: req.body.isPinned,
                updatedBy: (req.user?.email || 'system')
            });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal note updated.', note);
        }
        catch (error) {
            next(error);
        }
    },
    deleteNote: async (req, res, next) => {
        try {
            await dealWorkspace_service_1.dealWorkspaceService.deleteNote(req.params.noteId, (req.user?.email || 'system'));
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal note removed.');
        }
        catch (error) {
            next(error);
        }
    },
    getActivities: async (req, res, next) => {
        try {
            const filters = {
                type: req.query.type,
                priority: req.query.priority,
                status: req.query.status,
                search: req.query.search,
            };
            const data = await dealWorkspace_service_1.dealWorkspaceService.getActivities(req.params.id, filters);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal activities loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    createActivity: async (req, res, next) => {
        try {
            const activity = await dealWorkspace_service_1.dealWorkspaceService.createActivity(req.params.id, req.body, (req.user?.email || 'system'));
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Deal activity scheduled.', activity);
        }
        catch (error) {
            next(error);
        }
    },
    updateActivity: async (req, res, next) => {
        try {
            const activity = await dealWorkspace_service_1.dealWorkspaceService.updateActivity(req.params.activityId, req.body, (req.user?.email || 'system'));
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal activity updated.', activity);
        }
        catch (error) {
            next(error);
        }
    },
    deleteActivity: async (req, res, next) => {
        try {
            await dealWorkspace_service_1.dealWorkspaceService.deleteActivity(req.params.activityId, (req.user?.email || 'system'));
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal activity removed.');
        }
        catch (error) {
            next(error);
        }
    },
    getFiles: async (req, res, next) => {
        try {
            const data = await dealWorkspace_service_1.dealWorkspaceService.getFiles(req.params.id, req.query.search);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal files loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    createFile: async (req, res, next) => {
        try {
            const file = await dealWorkspace_service_1.dealWorkspaceService.createFile(req.params.id, {
                name: req.body.name,
                path: req.body.path,
                mimeType: req.body.mimeType,
                size: req.body.size,
            }, (req.user?.email || 'system'));
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'File attached successfully.', file);
        }
        catch (error) {
            next(error);
        }
    },
    deleteFile: async (req, res, next) => {
        try {
            await dealWorkspace_service_1.dealWorkspaceService.deleteFile(req.params.fileId, (req.user?.email || 'system'));
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'File attachment removed.');
        }
        catch (error) {
            next(error);
        }
    },
    getHistory: async (req, res, next) => {
        try {
            const data = await dealWorkspace_service_1.dealWorkspaceService.getHistory(req.params.id, req.query.search);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal history loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    getProducts: async (req, res, next) => {
        try {
            const data = await dealWorkspace_service_1.dealWorkspaceService.getProducts(req.params.id, req.query.search);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal products loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    getQuotes: async (req, res, next) => {
        try {
            const data = await dealWorkspace_service_1.dealWorkspaceService.getQuotes(req.params.id, req.query.search);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal quotes loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
};
