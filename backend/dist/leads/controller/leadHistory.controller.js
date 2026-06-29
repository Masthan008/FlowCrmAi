"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadHistoryController = void 0;
const leadHistory_service_1 = require("../service/leadHistory.service");
const response_1 = require("../../helpers/response");
exports.leadHistoryController = {
    list: async (req, res, next) => {
        try {
            const filters = {
                search: req.query.search,
            };
            const history = await leadHistory_service_1.leadHistoryService.getHistory(req.params.id, filters);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'History retrieved successfully.', history);
        }
        catch (error) {
            next(error);
        }
    }
};
exports.default = exports.leadHistoryController;
