import { leadActivityRepository } from '../repository/leadActivity.repository';
import { leadTimelineService } from './leadTimeline.service';

export const leadActivityService = {
  getActivities: async (leadId: string, filters: any) => {
    return leadActivityRepository.findByFilters(leadId, filters);
  },

  createActivity: async (leadId: string, data: any, userId?: string) => {
    const activity = await leadActivityRepository.create({
      leadId,
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

    // Determine timeline type & styling
    let timelineType = 'ACTIVITY_LOGGED';
    let icon = 'Activity';
    let color = '#6B7280';

    if (data.type === 'Call') {
      timelineType = 'CALL_LOGGED';
      icon = 'Phone';
      color = '#10B981'; // green
    } else if (data.type === 'Meeting') {
      timelineType = 'MEETING_SCHEDULED';
      icon = 'Calendar';
      color = '#8B5CF6'; // purple
    } else if (data.type === 'Email') {
      timelineType = 'EMAIL_SENT';
      icon = 'Mail';
      color = '#3B82F6'; // blue
    } else if (data.type === 'Task') {
      timelineType = 'TASK_CREATED';
      icon = 'CheckCircle';
      color = '#6366F1'; // indigo
    }

    await leadTimelineService.logEvent({
      leadId,
      type: timelineType,
      title: data.title,
      description: data.description,
      icon,
      color,
      createdBy: userId || 'system',
    });

    return activity;
  },

  updateActivity: async (activityId: string, data: any, userId?: string) => {
    const existing = await leadActivityRepository.findById(activityId);
    if (!existing) {
      throw Object.assign(new Error('Activity not found'), { statusCode: 404 });
    }

    const updated = await leadActivityRepository.update(activityId, {
      type: data.type !== undefined ? data.type : existing.type,
      title: data.title !== undefined ? data.title : existing.title,
      description: data.description !== undefined ? data.description : existing.description,
      activityDate: data.activityDate !== undefined ? new Date(data.activityDate) : existing.activityDate,
      status: data.status !== undefined ? data.status : existing.status,
      priority: data.priority !== undefined ? data.priority : existing.priority,
      isCompleted: data.isCompleted !== undefined ? data.isCompleted : existing.isCompleted,
      assignedToId: data.assignedToId !== undefined ? data.assignedToId : existing.assignedToId,
      updatedBy: userId || null,
    });

    // Check if status changed to Completed and log to timeline
    if (updated.isCompleted && !existing.isCompleted) {
      await leadTimelineService.logEvent({
        leadId: updated.leadId,
        type: 'ACTIVITY_COMPLETED',
        title: `Completed Activity: ${updated.title}`,
        description: `Activity type: ${updated.type}`,
        icon: 'CheckSquare',
        color: '#10B981',
        createdBy: userId || 'system',
      });
    }

    return updated;
  },

  deleteActivity: async (activityId: string, userId?: string) => {
    const existing = await leadActivityRepository.findById(activityId);
    if (!existing) {
      throw Object.assign(new Error('Activity not found'), { statusCode: 404 });
    }
    return leadActivityRepository.softDelete(activityId, userId || null);
  }
};

export default leadActivityService;
