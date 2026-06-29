"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealController = void 0;
const deal_service_1 = require("../service/deal.service");
const response_1 = require("../../helpers/response");
exports.dealController = {
    list: async (req, res, next) => {
        try {
            const result = await deal_service_1.dealService.list(req.query, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deals retrieved successfully.', result.items, {
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
    getStatistics: async (req, res, next) => {
        try {
            const data = await deal_service_1.dealService.getStatistics(req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal statistics retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const deal = await deal_service_1.dealService.getById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal retrieved successfully.', deal);
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const deal = await deal_service_1.dealService.create(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Deal created successfully.', deal);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const deal = await deal_service_1.dealService.update(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal updated successfully.', deal);
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await deal_service_1.dealService.delete(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal deleted successfully.');
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
    bulkUpdateStatus: async (req, res, next) => {
        try {
            const { ids, status } = req.body;
            await deal_service_1.dealService.bulkUpdateStatus(ids, status, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal statuses updated successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    updateStage: async (req, res, next) => {
        try {
            const { id, stageId } = req.body;
            const deal = await deal_service_1.dealService.updateStage(id, stageId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal stage updated successfully.', deal);
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
    bulkUpdateOwner: async (req, res, next) => {
        try {
            const { ids, ownerId } = req.body;
            await deal_service_1.dealService.bulkUpdateOwner(ids, ownerId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal owners updated successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    getEmployees: async (req, res, next) => {
        try {
            const data = await deal_service_1.dealService.getEmployees();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Employees retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.dealController;
