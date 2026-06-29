"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactActivityService = void 0;
const contactActivity_repository_1 = require("../repository/contactActivity.repository");
const contactTimeline_service_1 = require("./contactTimeline.service");
exports.contactActivityService = {
    getActivities: async (contactId, params) => {
        return contactActivity_repository_1.contactActivityRepository.findByContactId(contactId, params);
    },
    createActivity: async (contactId, data, userId) => {
        const activity = await contactActivity_repository_1.contactActivityRepository.create({
            contactId,
            type: data.type,
            title: data.title,
            description: data.description || null,
            activityDate: new Date(data.activityDate),
            status: data.status || 'Planned',
            priority: data.priority || 'Medium',
            assignedToId: data.assignedToId || null,
            createdBy: userId || null,
        });
        // Log to timeline
        await contactTimeline_service_1.contactTimelineService.logEvent({
            contactId,
            type: 'MEETING_SCHEDULED',
            title: `${data.type} Created`,
            description: `Created activity: "${data.title}"`,
            icon: 'Calendar',
            color: '#3B82F6',
            createdBy: userId || 'system',
        });
        return activity;
    },
    updateActivity: async (activityId, data, userId) => {
        const existing = await contactActivity_repository_1.contactActivityRepository.findById(activityId);
        if (!existing) {
            throw Object.assign(new Error('Activity not found'), { statusCode: 404 });
        }
        return contactActivity_repository_1.contactActivityRepository.update(activityId, {
            type: data.type,
            title: data.title,
            description: data.description || null,
            activityDate: data.activityDate ? new Date(data.activityDate) : undefined,
            status: data.status,
            priority: data.priority,
            assignedToId: data.assignedToId,
            updatedBy: userId || null,
        });
    },
    deleteActivity: async (activityId, userId) => {
        const existing = await contactActivity_repository_1.contactActivityRepository.findById(activityId);
        if (!existing) {
            throw Object.assign(new Error('Activity not found'), { statusCode: 404 });
        }
        await contactActivity_repository_1.contactActivityRepository.softDelete(activityId, userId || null);
        // Log to timeline
        await contactTimeline_service_1.contactTimelineService.logEvent({
            contactId: existing.contactId,
            type: 'ACTIVITY_DELETED',
            title: 'Activity Deleted',
            description: `Deleted activity: "${existing.title}"`,
            icon: 'Trash2',
            color: '#EF4444',
            createdBy: userId || 'system',
        });
        return { success: true };
    }
};
exports.default = exports.contactActivityService;
