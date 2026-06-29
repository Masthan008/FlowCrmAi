"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerJourneyService = void 0;
const customerJourney_repository_1 = require("../repository/customerJourney.repository");
const companyTimeline_service_1 = require("./companyTimeline.service");
exports.customerJourneyService = {
    getJourney: async (companyId) => {
        return customerJourney_repository_1.customerJourneyRepository.findByCompanyId(companyId);
    },
    createJourneyEntry: async (companyId, data, userId) => {
        const entry = await customerJourney_repository_1.customerJourneyRepository.create({
            companyId,
            type: data.type,
            title: data.title,
            description: data.description || null,
            eventDate: data.eventDate ? new Date(data.eventDate) : new Date(),
            icon: data.icon || null,
            color: data.color || null,
            metadata: data.metadata ? JSON.stringify(data.metadata) : null,
            createdBy: userId || null,
        });
        await companyTimeline_service_1.companyTimelineService.logEvent({
            companyId,
            type: 'JOURNEY_MILESTONE',
            title: `Journey: ${data.title}`,
            description: `Customer journey milestone: ${data.type}`,
            icon: data.icon || 'MapPin',
            color: data.color || '#F59E0B',
            createdBy: userId || 'system',
        });
        return entry;
    },
    deleteJourneyEntry: async (entryId, companyId, userId) => {
        const existing = await customerJourney_repository_1.customerJourneyRepository.findById(entryId);
        if (!existing)
            throw Object.assign(new Error('Journey entry not found'), { statusCode: 404 });
        await customerJourney_repository_1.customerJourneyRepository.softDelete(entryId, userId || null);
        await companyTimeline_service_1.companyTimelineService.logEvent({
            companyId,
            type: 'JOURNEY_MILESTONE_REMOVED',
            title: `Journey Milestone Removed: ${existing.title}`,
            description: 'Customer journey milestone removed',
            icon: 'MapPin',
            color: '#EF4444',
            createdBy: userId || 'system',
        });
    },
};
