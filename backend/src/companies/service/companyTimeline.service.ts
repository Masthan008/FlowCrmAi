import { companyTimelineRepository } from '../repository/companyTimeline.repository';

export const companyTimelineService = {
  getTimeline: async (companyId: string, filters: { search?: string; startDate?: string; endDate?: string }) => {
    return companyTimelineRepository.findByCompanyId(companyId, filters);
  },

  logEvent: async (data: {
    companyId: string; type: string; title: string; description?: string;
    icon?: string; color?: string; createdBy?: string;
  }) => {
    return companyTimelineRepository.logEvent(data);
  },
};
