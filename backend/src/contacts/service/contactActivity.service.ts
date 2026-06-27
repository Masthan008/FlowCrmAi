import { contactActivityRepository } from '../repository/contactActivity.repository';
import { contactTimelineService } from './contactTimeline.service';

export const contactActivityService = {
  getActivities: async (contactId: string, params: any) => {
    return contactActivityRepository.findByContactId(contactId, params);
  },

  createActivity: async (contactId: string, data: any, userId?: string) => {
    const activity = await contactActivityRepository.create({
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
    await contactTimelineService.logEvent({
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

  updateActivity: async (activityId: string, data: any, userId?: string) => {
    const existing = await contactActivityRepository.findById(activityId);
    if (!existing) {
      throw Object.assign(new Error('Activity not found'), { statusCode: 404 });
    }

    return contactActivityRepository.update(activityId, {
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

  deleteActivity: async (activityId: string, userId?: string) => {
    const existing = await contactActivityRepository.findById(activityId);
    if (!existing) {
      throw Object.assign(new Error('Activity not found'), { statusCode: 404 });
    }
    await contactActivityRepository.softDelete(activityId, userId || null);

    // Log to timeline
    await contactTimelineService.logEvent({
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

export default contactActivityService;
