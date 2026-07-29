"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderController = void 0;
const order_service_1 = require("../service/order.service");
const response_1 = require("../../helpers/response");
exports.orderController = {
    list: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const search = req.query.search;
            const status = req.query.status;
            const customerId = req.query.customerId;
            const result = await order_service_1.orderService.getOrders({ page, limit, search, status, customerId });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Orders retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const order = await order_service_1.orderService.getOrderById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Order details retrieved successfully.', order);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const order = await order_service_1.orderService.createOrder(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Order created successfully.', order);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const order = await order_service_1.orderService.updateOrder(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Order updated successfully.', order);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await order_service_1.orderService.deleteOrder(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Order deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    updateStatus: async (req, res, next) => {
        try {
            const order = await order_service_1.orderService.updateOrderStatus(req.params.id, req.body.status, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Order status updated successfully.', order);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.orderController;
