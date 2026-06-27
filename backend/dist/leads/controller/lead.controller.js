"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadController = void 0;
const lead_service_1 = require("../service/lead.service");
const response_1 = require("../../helpers/response");
exports.leadController = {
    /**
     * GET /leads
     */
    list: async (req, res, next) => {
        try {
            const result = await lead_service_1.leadService.list({
                page: req.query.page,
                limit: req.query.limit,
                search: req.query.search,
                status: req.query.status,
                source: req.query.source,
                priority: req.query.priority,
                owner: req.query.owner,
                sortBy: req.query.sortBy,
                sortDir: req.query.sortDir,
            });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Leads retrieved successfully.', result.items, {
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
     * GET /leads/statistics
     */
    getStatistics: async (req, res, next) => {
        try {
            const data = await lead_service_1.leadService.getStatistics();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead statistics retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /leads/sources
     */
    getSources: async (req, res, next) => {
        try {
            const data = await lead_service_1.leadService.getSources();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead sources retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /leads/statuses
     */
    getStatuses: async (req, res, next) => {
        try {
            const data = await lead_service_1.leadService.getStatuses();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead statuses retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * GET /leads/:id
     */
    getById: async (req, res, next) => {
        try {
            const lead = await lead_service_1.leadService.getById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead retrieved successfully.', lead);
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
    /**
     * POST /leads
     */
    create: async (req, res, next) => {
        try {
            const lead = await lead_service_1.leadService.create(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Lead created successfully.', lead);
        }
        catch (error) {
            next(error);
        }
    },
    /**
     * PUT /leads/:id
     */
    update: async (req, res, next) => {
        try {
            const lead = await lead_service_1.leadService.update(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead updated successfully.', lead);
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
    /**
     * DELETE /leads/:id
     */
    delete: async (req, res, next) => {
        try {
            await lead_service_1.leadService.delete(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead deleted successfully.');
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
    /**
     * PATCH /leads/:id/status
     */
    updateStatus: async (req, res, next) => {
        try {
            const lead = await lead_service_1.leadService.updateStatus(req.params.id, req.body.statusId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead status updated successfully.', lead);
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
    /**
     * PATCH /leads/:id/owner
     */
    updateOwner: async (req, res, next) => {
        try {
            const lead = await lead_service_1.leadService.updateOwner(req.params.id, req.body.assignedToId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead owner updated successfully.', lead);
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
    /**
     * PATCH /leads/:id/priority
     */
    updatePriority: async (req, res, next) => {
        try {
            const lead = await lead_service_1.leadService.updatePriority(req.params.id, req.body.priority, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead priority updated successfully.', lead);
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
    /**
     * PATCH /leads/:id/rating
     */
    updateRating: async (req, res, next) => {
        try {
            const lead = await lead_service_1.leadService.updateRating(req.params.id, req.body.rating, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lead rating updated successfully.', lead);
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
};
exports.default = exports.leadController;
