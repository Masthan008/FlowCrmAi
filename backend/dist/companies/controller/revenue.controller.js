"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.revenueController = void 0;
const revenue_service_1 = require("../service/revenue.service");
const companyRelatedData_service_1 = require("../service/companyRelatedData.service");
const response_1 = require("../../helpers/response");
exports.revenueController = {
    list: async (req, res, next) => {
        try {
            const revenue = await revenue_service_1.revenueService.getRevenue(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Revenue data retrieved successfully.', revenue);
        }
        catch (error) {
            next(error);
        }
    },
    getSummary: async (req, res, next) => {
        try {
            const summary = await revenue_service_1.revenueService.getRevenueSummary(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Revenue summary retrieved successfully.', summary);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const entry = await revenue_service_1.revenueService.createRevenueEntry(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Revenue entry created successfully.', entry);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await revenue_service_1.revenueService.deleteRevenueEntry(req.params.entryId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Revenue entry deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    getDashboard: async (req, res, next) => {
        try {
            const dashboard = await companyRelatedData_service_1.companyRelatedDataService.getRevenueDashboard(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Revenue dashboard retrieved successfully.', dashboard);
        }
        catch (error) {
            next(error);
        }
    },
};
