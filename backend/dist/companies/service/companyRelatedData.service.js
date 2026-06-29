"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyRelatedDataService = void 0;
const companyRelatedData_repository_1 = require("../repository/companyRelatedData.repository");
exports.companyRelatedDataService = {
    getContacts: async (companyId) => {
        return companyRelatedData_repository_1.companyRelatedDataRepository.getContacts(companyId);
    },
    getLeads: async (companyId) => {
        return companyRelatedData_repository_1.companyRelatedDataRepository.getLeads(companyId);
    },
    getLeadsSummary: async (companyId) => {
        return companyRelatedData_repository_1.companyRelatedDataRepository.getLeadsSummary(companyId);
    },
    getDeals: async (companyId) => {
        return companyRelatedData_repository_1.companyRelatedDataRepository.getDeals(companyId);
    },
    getDealsSummary: async (companyId) => {
        return companyRelatedData_repository_1.companyRelatedDataRepository.getDealsSummary(companyId);
    },
    getQuotes: async (companyId) => {
        return companyRelatedData_repository_1.companyRelatedDataRepository.getQuotes(companyId);
    },
    getInvoices: async (companyId) => {
        return companyRelatedData_repository_1.companyRelatedDataRepository.getInvoices(companyId);
    },
    getPayments: async (companyId) => {
        return companyRelatedData_repository_1.companyRelatedDataRepository.getPayments(companyId);
    },
    getPaymentsSummary: async (companyId) => {
        return companyRelatedData_repository_1.companyRelatedDataRepository.getPaymentsSummary(companyId);
    },
    getRevenueDashboard: async (companyId) => {
        return companyRelatedData_repository_1.companyRelatedDataRepository.getRevenueDashboard(companyId);
    },
};
