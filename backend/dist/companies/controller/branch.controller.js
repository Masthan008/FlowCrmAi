"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchController = void 0;
const branch_service_1 = require("../service/branch.service");
const response_1 = require("../../helpers/response");
exports.branchController = {
    list: async (req, res, next) => {
        try {
            const branches = await branch_service_1.branchService.getBranches(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Branches retrieved successfully.', branches);
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const branch = await branch_service_1.branchService.getBranch(req.params.branchId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Branch retrieved successfully.', branch);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const branch = await branch_service_1.branchService.createBranch(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Branch created successfully.', branch);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const branch = await branch_service_1.branchService.updateBranch(req.params.branchId, req.body, req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Branch updated successfully.', branch);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await branch_service_1.branchService.deleteBranch(req.params.branchId, req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Branch deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
};
