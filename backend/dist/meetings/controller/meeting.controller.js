"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meetingController = void 0;
const meeting_service_1 = require("../service/meeting.service");
const response_1 = require("../../helpers/response");
exports.meetingController = {
    list: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const search = req.query.search;
            const organizerId = req.query.organizerId;
            const customerId = req.query.customerId;
            const dealId = req.query.dealId;
            const result = await meeting_service_1.meetingService.getMeetings({ page, limit, search, organizerId, customerId, dealId });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Meetings retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const meeting = await meeting_service_1.meetingService.getMeetingById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Meeting details retrieved successfully.', meeting);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const meeting = await meeting_service_1.meetingService.createMeeting({
                ...req.body,
                startTime: new Date(req.body.startTime),
                endTime: new Date(req.body.endTime),
            }, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Meeting created successfully.', meeting);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const updateData = { ...req.body };
            if (req.body.startTime)
                updateData.startTime = new Date(req.body.startTime);
            if (req.body.endTime)
                updateData.endTime = new Date(req.body.endTime);
            const meeting = await meeting_service_1.meetingService.updateMeeting(req.params.id, updateData, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Meeting updated successfully.', meeting);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await meeting_service_1.meetingService.deleteMeeting(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Meeting deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.meetingController;
