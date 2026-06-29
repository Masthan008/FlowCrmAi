"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactController = void 0;
const contact_service_1 = require("../service/contact.service");
const response_1 = require("../../helpers/response");
exports.contactController = {
    /**
     * GET /contacts
     */
    list: async (req, res, next) => {
        try {
            const currentUserId = req.user?.id;
            const result = await contact_service_1.contactService.list(req.query, currentUserId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Contacts retrieved successfully.', result.items, {
                page: result.page,
                limit: result.limit,
                totalItems: result.totalItems,
                totalPages: result.totalPages,
            });
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /contacts/statistics
     */
    getStatistics: async (req, res, next) => {
        try {
            const data = await contact_service_1.contactService.getStatistics(req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Contact statistics retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /contacts/:id
     */
    getById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const contact = await contact_service_1.contactService.getById(id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Contact retrieved successfully.', contact);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * POST /contacts
     */
    create: async (req, res, next) => {
        try {
            const currentUserId = req.user?.id || 'system';
            const contact = await contact_service_1.contactService.create(req.body, currentUserId);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Contact created successfully.', contact);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PUT /contacts/:id
     */
    update: async (req, res, next) => {
        try {
            const { id } = req.params;
            const currentUserId = req.user?.id || 'system';
            const contact = await contact_service_1.contactService.update(id, req.body, currentUserId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Contact updated successfully.', contact);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * DELETE /contacts/:id
     */
    delete: async (req, res, next) => {
        try {
            const { id } = req.params;
            const currentUserId = req.user?.id || 'system';
            await contact_service_1.contactService.delete(id, currentUserId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Contact deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PATCH /contacts/status (Bulk status update)
     */
    bulkUpdateStatus: async (req, res, next) => {
        try {
            const { ids, status } = req.body;
            const currentUserId = req.user?.id || 'system';
            const result = await contact_service_1.contactService.bulkUpdateStatus(ids, status, currentUserId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Contacts status updated successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PATCH /contacts/owner (Bulk owner update)
     */
    bulkUpdateOwner: async (req, res, next) => {
        try {
            const { ids, ownerId } = req.body;
            const currentUserId = req.user?.id || 'system';
            const result = await contact_service_1.contactService.bulkUpdateOwner(ids, ownerId, currentUserId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Contacts owner updated successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.contactController;
