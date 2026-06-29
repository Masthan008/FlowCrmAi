"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerJourneyController = void 0;
const customerJourney_service_1 = require("../service/customerJourney.service");
const response_1 = require("../../helpers/response");
exports.customerJourneyController = {
    list: async (req, res, next) => {
        try {
            const journey = await customerJourney_service_1.customerJourneyService.getJourney(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Customer journey retrieved successfully.', journey);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const entry = await customerJourney_service_1.customerJourneyService.createJourneyEntry(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Journey entry created successfully.', entry);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await customerJourney_service_1.customerJourneyService.deleteJourneyEntry(req.params.entryId, req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Journey entry deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
};
