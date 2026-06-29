"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyTimelineController = void 0;
const companyTimeline_service_1 = require("../service/companyTimeline.service");
const response_1 = require("../../helpers/response");
exports.companyTimelineController = {
    list: async (req, res, next) => {
        try {
            const filters = {
                search: req.query.search,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            };
            const timeline = await companyTimeline_service_1.companyTimelineService.getTimeline(req.params.id, filters);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Timeline retrieved successfully.', timeline);
        }
        catch (error) {
            next(error);
        }
    },
};
