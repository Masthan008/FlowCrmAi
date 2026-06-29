"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadHistoryService = void 0;
const leadHistory_repository_1 = require("../repository/leadHistory.repository");
exports.leadHistoryService = {
    getHistory: async (leadId, filters) => {
        return leadHistory_repository_1.leadHistoryRepository.findByLeadId(leadId, filters);
    },
    logChange: async (data) => {
        return leadHistory_repository_1.leadHistoryRepository.logChange(data);
    }
};
exports.default = exports.leadHistoryService;
