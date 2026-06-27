import { customerJourneyRepository } from '../repository/customerJourney.repository';
import { companyTimelineService } from './companyTimeline.service';

export const customerJourneyService = {
  getJourney: async (companyId: string) => {
    return customerJourneyRepository.findByCompanyId(companyId);
  },

  createJourneyEntry: async (companyId: string, data: any, userId?: string) => {
    const entry = await customerJourneyRepository.create({
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

    await companyTimelineService.logEvent({
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

  deleteJourneyEntry: async (entryId: string, companyId: string, userId?: string) => {
    const existing = await customerJourneyRepository.findById(entryId);
    if (!existing) throw Object.assign(new Error('Journey entry not found'), { statusCode: 404 });

    await customerJourneyRepository.softDelete(entryId, userId || null);

    await companyTimelineService.logEvent({
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
