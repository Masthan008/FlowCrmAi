"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyActivityService = void 0;
const companyActivity_repository_1 = require("../repository/companyActivity.repository");
const companyTimeline_service_1 = require("./companyTimeline.service");
exports.companyActivityService = {
    getActivities: async (companyId, filters) => {
        return companyActivity_repository_1.companyActivityRepository.findByFilters(companyId, filters);
    },
    createActivity: async (companyId, data, userId) => {
        const activity = await companyActivity_repository_1.companyActivityRepository.create({
            companyId,
            type: data.type,
            title: data.title,
            description: data.description || null,
            activityDate: new Date(data.activityDate),
            status: data.status || 'Planned',
            priority: data.priority || 'Medium',
            isCompleted: data.isCompleted || false,
            assignedToId: data.assignedToId || null,
            createdBy: userId || null,
        });
        await companyTimeline_service_1.companyTimelineService.logEvent({
            companyId,
            type: 'ACTIVITY_LOGGED',
            title: `Activity: ${data.type}`,
            description: data.title,
            icon: 'Calendar',
            color: '#8B5CF6',
            createdBy: userId || 'system',
        });
        return activity;
    },
    updateActivity: async (activityId, data, userId) => {
        const existing = await companyActivity_repository_1.companyActivityRepository.findById(activityId);
        if (!existing)
            throw Object.assign(new Error('Activity not found'), { statusCode: 404 });
        return companyActivity_repository_1.companyActivityRepository.update(activityId, {
            ...data,
            activityDate: data.activityDate ? new Date(data.activityDate) : undefined,
            updatedBy: userId || null,
        });
    },
    deleteActivity: async (activityId, userId) => {
        const existing = await companyActivity_repository_1.companyActivityRepository.findById(activityId);
        if (!existing)
            throw Object.assign(new Error('Activity not found'), { statusCode: 404 });
        return companyActivity_repository_1.companyActivityRepository.softDelete(activityId, userId || null);
    },
};
