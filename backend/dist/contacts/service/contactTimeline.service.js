"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactTimelineService = void 0;
const contactTimeline_repository_1 = require("../repository/contactTimeline.repository");
exports.contactTimelineService = {
    getTimeline: async (contactId, search) => {
        return contactTimeline_repository_1.contactTimelineRepository.findByContactId(contactId, search);
    },
    logEvent: async (params) => {
        return contactTimeline_repository_1.contactTimelineRepository.create({
            contactId: params.contactId,
            type: params.type,
            title: params.title,
            description: params.description || null,
            icon: params.icon || null,
            color: params.color || null,
            createdBy: params.createdBy || 'system',
        });
    },
};
exports.default = exports.contactTimelineService;
