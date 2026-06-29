"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactTimelineController = void 0;
const contactTimeline_service_1 = require("../service/contactTimeline.service");
const response_1 = require("../../helpers/response");
exports.contactTimelineController = {
    list: async (req, res, next) => {
        try {
            const timeline = await contactTimeline_service_1.contactTimelineService.getTimeline(req.params.id, req.query.search);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Timeline retrieved successfully.', timeline);
        }
        catch (error) {
            next(error);
        }
    }
};
exports.default = exports.contactTimelineController;
