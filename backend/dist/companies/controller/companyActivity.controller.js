"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyActivityController = void 0;
const companyActivity_service_1 = require("../service/companyActivity.service");
const response_1 = require("../../helpers/response");
exports.companyActivityController = {
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
            const activities = await companyActivity_service_1.companyActivityService.getActivities(req.params.id, filters);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Activities retrieved successfully.', activities);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const activity = await companyActivity_service_1.companyActivityService.createActivity(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Activity created successfully.', activity);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const activity = await companyActivity_service_1.companyActivityService.updateActivity(req.params.activityId, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Activity updated successfully.', activity);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await companyActivity_service_1.companyActivityService.deleteActivity(req.params.activityId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Activity deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
};
