"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealWorkspaceController = void 0;
const dealWorkspace_service_1 = require("../service/dealWorkspace.service");
const response_1 = require("../../helpers/response");
const db_1 = require("../../database/db");
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
    addProductLine: async (req, res, next) => {
        try {
            const data = await dealWorkspace_service_1.dealWorkspaceService.addProductLine(req.params.id, req.body, req.user?.email || 'system');
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Deal product created successfully.', data);
        }
        catch (error) {
            next(error);
        }
    },
    updateProductLine: async (req, res, next) => {
        try {
            const data = await dealWorkspace_service_1.dealWorkspaceService.updateProductLine(req.params.productId, req.body, req.user?.email || 'system');
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal product updated successfully.', data);
        }
        catch (error) {
            next(error);
        }
    },
    deleteProductLine: async (req, res, next) => {
        try {
            await dealWorkspace_service_1.dealWorkspaceService.deleteProductLine(req.params.productId, req.user?.email || 'system');
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal product line deleted.');
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
    createQuote: async (req, res, next) => {
        try {
            const data = await dealWorkspace_service_1.dealWorkspaceService.createQuote(req.params.id, req.body, req.user?.email || 'system');
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Deal quote prepared successfully.', data);
        }
        catch (error) {
            next(error);
        }
    },
    updateQuote: async (req, res, next) => {
        try {
            const data = await dealWorkspace_service_1.dealWorkspaceService.updateQuote(req.params.quoteId, req.body, req.user?.email || 'system');
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal quote updated successfully.', data);
        }
        catch (error) {
            next(error);
        }
    },
    approveQuote: async (req, res, next) => {
        try {
            const data = await dealWorkspace_service_1.dealWorkspaceService.approveQuote(req.params.quoteId, req.user?.id || req.user?.email || 'system');
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Quote approved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    },
    rejectQuote: async (req, res, next) => {
        try {
            const data = await dealWorkspace_service_1.dealWorkspaceService.rejectQuote(req.params.quoteId, req.user?.id || req.user?.email || 'system');
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Quote rejected successfully.', data);
        }
        catch (error) {
            next(error);
        }
    },
    getCompetitors: async (req, res, next) => {
        try {
            const data = await dealWorkspace_service_1.dealWorkspaceService.getCompetitors(req.params.id, req.query.search);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal competitors loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    createCompetitor: async (req, res, next) => {
        try {
            const data = await dealWorkspace_service_1.dealWorkspaceService.createCompetitor(req.params.id, req.body, req.user?.email || 'system');
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Competitor added successfully.', data);
        }
        catch (error) {
            next(error);
        }
    },
    getCollaboration: async (req, res, next) => {
        try {
            const data = await dealWorkspace_service_1.dealWorkspaceService.getCollaboration(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal collaboration loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    createComment: async (req, res, next) => {
        try {
            const employee = await db_1.prisma.employee.findFirst({
                where: { userId: req.user?.id || undefined }
            });
            const data = await dealWorkspace_service_1.dealWorkspaceService.createComment(req.params.id, {
                comment: req.body.comment,
                employeeId: employee?.id || undefined,
                parentId: req.body.parentId || undefined,
                isPinned: req.body.isPinned || false,
                emoji: req.body.emoji || null
            }, req.user?.email || 'system');
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Comment added successfully.', data);
        }
        catch (error) {
            next(error);
        }
    },
    getChecklist: async (req, res, next) => {
        try {
            const data = await dealWorkspace_service_1.dealWorkspaceService.getChecklist(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal checklist loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    updateChecklistItem: async (req, res, next) => {
        try {
            const data = await dealWorkspace_service_1.dealWorkspaceService.updateChecklistItem(req.params.itemId, req.body.isCompleted, req.user?.email || 'system');
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Checklist item updated.', data);
        }
        catch (error) {
            next(error);
        }
    },
    getNegotiations: async (req, res, next) => {
        try {
            const data = await dealWorkspace_service_1.dealWorkspaceService.getNegotiations(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal negotiations loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    createNegotiation: async (req, res, next) => {
        try {
            const data = await dealWorkspace_service_1.dealWorkspaceService.createNegotiation(req.params.id, req.body, req.user?.email || 'system');
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Negotiation round created.', data);
        }
        catch (error) {
            next(error);
        }
    },
};
