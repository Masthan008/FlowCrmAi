"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactActivityController = void 0;
const contactActivity_service_1 = require("../service/contactActivity.service");
const response_1 = require("../../helpers/response");
exports.contactActivityController = {
    list: async (req, res, next) => {
        try {
            const activities = await contactActivity_service_1.contactActivityService.getActivities(req.params.id, req.query);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Activities retrieved successfully.', activities);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const activity = await contactActivity_service_1.contactActivityService.createActivity(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Activity created successfully.', activity);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const activity = await contactActivity_service_1.contactActivityService.updateActivity(req.params.activityId, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Activity updated successfully.', activity);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await contactActivity_service_1.contactActivityService.deleteActivity(req.params.activityId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Activity deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    }
};
exports.default = exports.contactActivityController;
