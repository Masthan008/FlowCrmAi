"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadTimelineController = void 0;
const leadTimeline_service_1 = require("../service/leadTimeline.service");
const response_1 = require("../../helpers/response");
exports.leadTimelineController = {
    list: async (req, res, next) => {
        try {
            const filters = {
                search: req.query.search,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            };
            const timeline = await leadTimeline_service_1.leadTimelineService.getTimeline(req.params.id, filters);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Timeline retrieved successfully.', timeline);
        }
        catch (error) {
            next(error);
        }
    }
};
exports.default = exports.leadTimelineController;
