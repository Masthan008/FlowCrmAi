import { companyActivityRepository } from '../repository/companyActivity.repository';
import { companyTimelineService } from './companyTimeline.service';

export const companyActivityService = {
  getActivities: async (companyId: string, filters: any) => {
    return companyActivityRepository.findByFilters(companyId, filters);
  },

  createActivity: async (companyId: string, data: any, userId?: string) => {
    const activity = await companyActivityRepository.create({
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

    await companyTimelineService.logEvent({
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

  updateActivity: async (activityId: string, data: any, userId?: string) => {
    const existing = await companyActivityRepository.findById(activityId);
    if (!existing) throw Object.assign(new Error('Activity not found'), { statusCode: 404 });
    return companyActivityRepository.update(activityId, {
      ...data,
      activityDate: data.activityDate ? new Date(data.activityDate) : undefined,
      updatedBy: userId || null,
    });
  },

  deleteActivity: async (activityId: string, userId?: string) => {
    const existing = await companyActivityRepository.findById(activityId);
    if (!existing) throw Object.assign(new Error('Activity not found'), { statusCode: 404 });
    return companyActivityRepository.softDelete(activityId, userId || null);
  },
};
