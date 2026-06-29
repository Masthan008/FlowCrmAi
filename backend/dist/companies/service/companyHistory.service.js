"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyHistoryService = void 0;
const companyHistory_repository_1 = require("../repository/companyHistory.repository");
exports.companyHistoryService = {
    getHistory: async (companyId, filters) => {
        return companyHistory_repository_1.companyHistoryRepository.findByCompanyId(companyId, filters);
    },
    logChange: async (data) => {
        return companyHistory_repository_1.companyHistoryRepository.logChange(data);
    },
};
