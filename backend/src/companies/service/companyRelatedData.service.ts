import { companyRelatedDataRepository } from '../repository/companyRelatedData.repository';

export const companyRelatedDataService = {
  getContacts: async (companyId: string) => {
    return companyRelatedDataRepository.getContacts(companyId);
  },

  getLeads: async (companyId: string) => {
    return companyRelatedDataRepository.getLeads(companyId);
  },

  getLeadsSummary: async (companyId: string) => {
    return companyRelatedDataRepository.getLeadsSummary(companyId);
  },

  getDeals: async (companyId: string) => {
    return companyRelatedDataRepository.getDeals(companyId);
  },

  getDealsSummary: async (companyId: string) => {
    return companyRelatedDataRepository.getDealsSummary(companyId);
  },

  getQuotes: async (companyId: string) => {
    return companyRelatedDataRepository.getQuotes(companyId);
  },

  getInvoices: async (companyId: string) => {
    return companyRelatedDataRepository.getInvoices(companyId);
  },

  getPayments: async (companyId: string) => {
    return companyRelatedDataRepository.getPayments(companyId);
  },

  getPaymentsSummary: async (companyId: string) => {
    return companyRelatedDataRepository.getPaymentsSummary(companyId);
  },

  getRevenueDashboard: async (companyId: string) => {
    return companyRelatedDataRepository.getRevenueDashboard(companyId);
  },
};
