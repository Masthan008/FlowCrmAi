"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = void 0;
const payment_service_1 = require("../service/payment.service");
const response_1 = require("../../helpers/response");
exports.paymentController = {
    list: async (req, res, next) => {
        try {
            const result = await payment_service_1.paymentService.list(req.query);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Payments retrieved successfully.', result.items, {
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
            const payment = await payment_service_1.paymentService.getById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Payment details retrieved.', payment);
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
            const payment = await payment_service_1.paymentService.create(req.body, userId);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Payment recorded successfully.', payment);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const payment = await payment_service_1.paymentService.update(req.params.id, req.body, userId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Payment updated successfully.', payment);
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
            await payment_service_1.paymentService.delete(req.params.id, userId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Payment deleted successfully.');
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
