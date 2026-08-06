"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calendarController = void 0;
const calendar_service_1 = require("../service/calendar.service");
const response_1 = require("../../helpers/response");
exports.calendarController = {
    list: async (req, res, next) => {
        try {
            const result = await calendar_service_1.calendarService.list(req.query);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Calendar events retrieved successfully.', result.items, {
                page: result.page,
                limit: result.limit,
                totalItems: result.totalItems,
                totalPages: result.totalPages,
            });
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const event = await calendar_service_1.calendarService.getById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Calendar event details retrieved.', event);
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const event = await calendar_service_1.calendarService.create(req.body, userId);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Calendar event created successfully.', event);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const event = await calendar_service_1.calendarService.update(req.params.id, req.body, userId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Calendar event updated successfully.', event);
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            await calendar_service_1.calendarService.delete(req.params.id, userId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Calendar event deleted successfully.');
        }
        catch (error) {
            if (error.statusCode === 404) {
                response_1.ResponseHelper.sendError(req, res, 404, error.message);
                return;
            }
            next(error);
        }
    },
};
