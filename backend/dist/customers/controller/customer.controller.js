"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerController = void 0;
const customer_service_1 = require("../service/customer.service");
const response_1 = require("../../helpers/response");
exports.customerController = {
    list: async (req, res, next) => {
        try {
            const result = await customer_service_1.customerService.list(req.query);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Customers retrieved successfully.', result.items, {
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
    getById: async (req, res, next) => {
        try {
            const customer = await customer_service_1.customerService.getById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Customer details retrieved.', customer);
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
            const userId = req.user?.id;
            const customer = await customer_service_1.customerService.create(req.body, userId);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Customer created successfully.', customer);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const customer = await customer_service_1.customerService.update(req.params.id, req.body, userId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Customer updated successfully.', customer);
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
            const userId = req.user?.id;
            await customer_service_1.customerService.delete(req.params.id, userId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Customer deleted successfully.');
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
