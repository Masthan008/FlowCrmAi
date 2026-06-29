"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyController = void 0;
const company_service_1 = require("../service/company.service");
const response_1 = require("../../helpers/response");
exports.companyController = {
    list: async (req, res, next) => {
        try {
            const currentUserId = req.user?.id;
            const result = await company_service_1.companyService.list(req.query, currentUserId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Companies retrieved successfully.', result.items, { page: result.page, limit: result.limit, totalItems: result.totalItems, totalPages: result.totalPages });
        }
        catch (error) {
            next(error);
        }
    },
    getStatistics: async (req, res, next) => {
        try {
            const data = await company_service_1.companyService.getStatistics(req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Company statistics retrieved successfully.', data);
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const { id } = req.params;
            const company = await company_service_1.companyService.getById(id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Company retrieved successfully.', company);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const currentUserId = req.user?.id;
            const company = await company_service_1.companyService.create(req.body, currentUserId);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Company created successfully.', company);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const { id } = req.params;
            const currentUserId = req.user?.id;
            const company = await company_service_1.companyService.update(id, req.body, currentUserId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Company updated successfully.', company);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            const { id } = req.params;
            const currentUserId = req.user?.id;
            await company_service_1.companyService.delete(id, currentUserId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Company deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    bulkUpdateStatus: async (req, res, next) => {
        try {
            const { ids, status } = req.body;
            const currentUserId = req.user?.id;
            await company_service_1.companyService.bulkUpdateStatus(ids, status, currentUserId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Company statuses updated successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    bulkUpdateOwner: async (req, res, next) => {
        try {
            const { ids, ownerId } = req.body;
            const currentUserId = req.user?.id;
            await company_service_1.companyService.bulkUpdateOwner(ids, ownerId, currentUserId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Company owners updated successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    getEmployees: async (req, res, next) => {
        try {
            const employees = await company_service_1.companyService.getEmployees();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Employees retrieved successfully.', employees);
        }
        catch (error) {
            next(error);
        }
    },
};
