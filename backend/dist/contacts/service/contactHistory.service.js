"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactHistoryService = void 0;
const contactHistory_repository_1 = require("../repository/contactHistory.repository");
exports.contactHistoryService = {
    getHistory: async (contactId, search) => {
        return contactHistory_repository_1.contactHistoryRepository.findByContactId(contactId, search);
    },
};
exports.default = exports.contactHistoryService;
