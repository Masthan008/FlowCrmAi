"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactHistoryController = void 0;
const contactHistory_service_1 = require("../service/contactHistory.service");
const response_1 = require("../../helpers/response");
exports.contactHistoryController = {
    list: async (req, res, next) => {
        try {
            const history = await contactHistory_service_1.contactHistoryService.getHistory(req.params.id, req.query.search);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Audit history retrieved successfully.', history);
        }
        catch (error) {
            next(error);
        }
    }
};
exports.default = exports.contactHistoryController;
