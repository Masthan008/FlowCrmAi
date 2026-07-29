"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commissionController = void 0;
const commission_service_1 = require("../service/commission.service");
const response_1 = require("../../helpers/response");
exports.commissionController = {
    listRules: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const search = req.query.search;
            const result = await commission_service_1.commissionService.getRules({ page, limit, search });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Commission rules retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    createRule: async (req, res, next) => {
        try {
            const rule = await commission_service_1.commissionService.createRule(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Commission rule created successfully.', rule);
        }
        catch (error) {
            next(error);
        }
    },
    updateRule: async (req, res, next) => {
        try {
            const rule = await commission_service_1.commissionService.updateRule(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Commission rule updated successfully.', rule);
        }
        catch (error) {
            next(error);
        }
    },
    deleteRule: async (req, res, next) => {
        try {
            await commission_service_1.commissionService.deleteRule(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Commission rule deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    listPayouts: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const employeeId = req.query.employeeId;
            const status = req.query.status;
            const periodStart = req.query.periodStart;
            const periodEnd = req.query.periodEnd;
            const result = await commission_service_1.commissionService.getPayouts({ page, limit, employeeId, status, periodStart, periodEnd });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Commission payouts retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getPayoutById: async (req, res, next) => {
        try {
            const payout = await commission_service_1.commissionService.getPayoutById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Commission payout details retrieved successfully.', payout);
        }
        catch (error) {
            next(error);
        }
    },
    calculatePayouts: async (req, res, next) => {
        try {
            const result = await commission_service_1.commissionService.calculatePayouts(req.body.periodStart, req.body.periodEnd);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Commission payouts calculated successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    approvePayout: async (req, res, next) => {
        try {
            const payout = await commission_service_1.commissionService.approvePayout(req.params.id, req.user?.id, req.body.notes);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Commission payout approved successfully.', payout);
        }
        catch (error) {
            next(error);
        }
    },
    payPayout: async (req, res, next) => {
        try {
            const payout = await commission_service_1.commissionService.payPayout(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Commission payout marked as paid successfully.', payout);
        }
        catch (error) {
            next(error);
        }
    },
    getDashboard: async (req, res, next) => {
        try {
            const dashboard = await commission_service_1.commissionService.getDashboard();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Commission dashboard data retrieved successfully.', dashboard);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.commissionController;
