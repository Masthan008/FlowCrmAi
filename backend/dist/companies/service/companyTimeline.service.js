"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyTimelineService = void 0;
const companyTimeline_repository_1 = require("../repository/companyTimeline.repository");
exports.companyTimelineService = {
    getTimeline: async (companyId, filters) => {
        return companyTimeline_repository_1.companyTimelineRepository.findByCompanyId(companyId, filters);
    },
    logEvent: async (data) => {
        return companyTimeline_repository_1.companyTimelineRepository.logEvent(data);
    },
};
