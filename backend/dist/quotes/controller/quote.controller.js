"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quoteController = void 0;
const quote_service_1 = require("../service/quote.service");
const response_1 = require("../../helpers/response");
exports.quoteController = {
    list: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const search = req.query.search;
            const status = req.query.status;
            const customerId = req.query.customerId;
            const dealId = req.query.dealId;
            const result = await quote_service_1.quoteService.getQuotes({ page, limit, search, status, customerId, dealId });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Quotes retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const quote = await quote_service_1.quoteService.getQuoteById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Quote details retrieved successfully.', quote);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const quote = await quote_service_1.quoteService.createQuote(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Quote created successfully.', quote);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const quote = await quote_service_1.quoteService.updateQuote(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Quote updated successfully.', quote);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await quote_service_1.quoteService.deleteQuote(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Quote deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.quoteController;
