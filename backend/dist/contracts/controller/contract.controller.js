"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractController = void 0;
const contract_service_1 = require("../service/contract.service");
const response_1 = require("../../helpers/response");
exports.contractController = {
    list: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const search = req.query.search;
            const status = req.query.status;
            const type = req.query.type;
            const customerId = req.query.customerId;
            const result = await contract_service_1.contractService.getContracts({ page, limit, search, status, type, customerId });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Contracts retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const contract = await contract_service_1.contractService.getContractById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Contract details retrieved successfully.', contract);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const contract = await contract_service_1.contractService.createContract(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Contract created successfully.', contract);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const contract = await contract_service_1.contractService.updateContract(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Contract updated successfully.', contract);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await contract_service_1.contractService.deleteContract(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Contract deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    approve: async (req, res, next) => {
        try {
            const contract = await contract_service_1.contractService.updateContractStatus(req.params.id, 'Approved', req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Contract approved successfully.', contract);
        }
        catch (error) {
            next(error);
        }
    },
    renew: async (req, res, next) => {
        try {
            const contract = await contract_service_1.contractService.renewContract(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Contract renewed successfully.', contract);
        }
        catch (error) {
            next(error);
        }
    },
    terminate: async (req, res, next) => {
        try {
            const contract = await contract_service_1.contractService.updateContractStatus(req.params.id, 'Terminated', req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Contract terminated successfully.', contract);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.contractController;
