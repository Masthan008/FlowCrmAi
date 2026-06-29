"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessNetworkController = void 0;
const businessNetwork_service_1 = require("../service/businessNetwork.service");
const response_1 = require("../../helpers/response");
exports.businessNetworkController = {
    list: async (req, res, next) => {
        try {
            const network = await businessNetwork_service_1.businessNetworkService.getNetwork(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Business network retrieved successfully.', network);
        }
        catch (error) {
            next(error);
        }
    },
    getGrouped: async (req, res, next) => {
        try {
            const grouped = await businessNetwork_service_1.businessNetworkService.getGroupedNetwork(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Business network grouped successfully.', grouped);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const entry = await businessNetwork_service_1.businessNetworkService.createNetworkEntry(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Network entry created successfully.', entry);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const entry = await businessNetwork_service_1.businessNetworkService.updateNetworkEntry(req.params.entryId, req.body, req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Network entry updated successfully.', entry);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await businessNetwork_service_1.businessNetworkService.deleteNetworkEntry(req.params.entryId, req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Network entry deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
};
