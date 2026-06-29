"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyHistoryController = void 0;
const companyHistory_service_1 = require("../service/companyHistory.service");
const response_1 = require("../../helpers/response");
exports.companyHistoryController = {
    list: async (req, res, next) => {
        try {
            const filters = { search: req.query.search };
            const history = await companyHistory_service_1.companyHistoryService.getHistory(req.params.id, filters);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'History retrieved successfully.', history);
        }
        catch (error) {
            next(error);
        }
    },
};
