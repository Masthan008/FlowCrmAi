import { leadHistoryRepository } from '../repository/leadHistory.repository';

export const leadHistoryService = {
  getHistory: async (leadId: string, filters: { search?: string }) => {
    return leadHistoryRepository.findByLeadId(leadId, filters);
  },

  logChange: async (data: {
    leadId: string;
    action: string;
    fieldName?: string;
    oldValue?: string;
    newValue?: string;
    userId?: string;
    createdBy?: string;
  }) => {
    return leadHistoryRepository.logChange(data);
  }
};

export default leadHistoryService;
