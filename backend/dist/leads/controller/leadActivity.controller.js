"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadActivityController = void 0;
const leadActivity_service_1 = require("../service/leadActivity.service");
const response_1 = require("../../helpers/response");
exports.leadActivityController = {
    list: async (req, res, next) => {
        try {
            const filters = {
                search: req.query.search,
                type: req.query.type,
                priority: req.query.priority,
                status: req.query.status,
                createdBy: req.query.createdBy,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            };
            const activities = await leadActivity_service_1.leadActivityService.getActivities(req.params.id, filters);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Activities retrieved successfully.', activities);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const activity = await leadActivity_service_1.leadActivityService.createActivity(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Activity created successfully.', activity);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const activity = await leadActivity_service_1.leadActivityService.updateActivity(req.params.activityId, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Activity updated successfully.', activity);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await leadActivity_service_1.leadActivityService.deleteActivity(req.params.activityId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Activity deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    }
};
exports.default = exports.leadActivityController;
