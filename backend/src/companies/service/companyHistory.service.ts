import { companyHistoryRepository } from '../repository/companyHistory.repository';

export const companyHistoryService = {
  getHistory: async (companyId: string, filters: { search?: string }) => {
    return companyHistoryRepository.findByCompanyId(companyId, filters);
  },

  logChange: async (data: {
    companyId: string; action: string; fieldName?: string;
    oldValue?: string; newValue?: string; userId?: string; createdBy?: string;
  }) => {
    return companyHistoryRepository.logChange(data);
  },
};
