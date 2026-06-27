import { leadTimelineRepository } from '../repository/leadTimeline.repository';

export const leadTimelineService = {
  getTimeline: async (leadId: string, filters: { search?: string; startDate?: string; endDate?: string }) => {
    return leadTimelineRepository.findByLeadId(leadId, filters);
  },

  logEvent: async (data: {
    leadId: string;
    type: string;
    title: string;
    description?: string;
    icon?: string;
    color?: string;
    createdBy?: string;
  }) => {
    return leadTimelineRepository.logEvent(data);
  }
};

export default leadTimelineService;
