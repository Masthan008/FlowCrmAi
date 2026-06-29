"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadTimelineService = void 0;
const leadTimeline_repository_1 = require("../repository/leadTimeline.repository");
exports.leadTimelineService = {
    getTimeline: async (leadId, filters) => {
        return leadTimeline_repository_1.leadTimelineRepository.findByLeadId(leadId, filters);
    },
    logEvent: async (data) => {
        return leadTimeline_repository_1.leadTimelineRepository.logEvent(data);
    }
};
exports.default = exports.leadTimelineService;
