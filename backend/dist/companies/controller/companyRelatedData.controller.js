"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyRelatedDataController = void 0;
const companyRelatedData_service_1 = require("../service/companyRelatedData.service");
const response_1 = require("../../helpers/response");
exports.companyRelatedDataController = {
    getContacts: async (req, res, next) => {
        try {
            const contacts = await companyRelatedData_service_1.companyRelatedDataService.getContacts(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Contacts retrieved successfully.', contacts);
        }
        catch (error) {
            next(error);
        }
    },
    getLeads: async (req, res, next) => {
        try {
            const leads = await companyRelatedData_service_1.companyRelatedDataService.getLeads(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Leads retrieved successfully.', leads);
        }
        catch (error) {
            next(error);
        }
    },
    getLeadsSummary: async (req, res, next) => {
        try {
            const summary = await companyRelatedData_service_1.companyRelatedDataService.getLeadsSummary(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Leads summary retrieved successfully.', summary);
        }
        catch (error) {
            next(error);
        }
    },
    getDeals: async (req, res, next) => {
        try {
            const deals = await companyRelatedData_service_1.companyRelatedDataService.getDeals(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deals retrieved successfully.', deals);
        }
        catch (error) {
            next(error);
        }
    },
    getDealsSummary: async (req, res, next) => {
        try {
            const summary = await companyRelatedData_service_1.companyRelatedDataService.getDealsSummary(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deals summary retrieved successfully.', summary);
        }
        catch (error) {
            next(error);
        }
    },
    getQuotes: async (req, res, next) => {
        try {
            const quotes = await companyRelatedData_service_1.companyRelatedDataService.getQuotes(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Quotes retrieved successfully.', quotes);
        }
        catch (error) {
            next(error);
        }
    },
    getInvoices: async (req, res, next) => {
        try {
            const invoices = await companyRelatedData_service_1.companyRelatedDataService.getInvoices(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Invoices retrieved successfully.', invoices);
        }
        catch (error) {
            next(error);
        }
    },
    getPayments: async (req, res, next) => {
        try {
            const payments = await companyRelatedData_service_1.companyRelatedDataService.getPayments(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Payments retrieved successfully.', payments);
        }
        catch (error) {
            next(error);
        }
    },
    getPaymentsSummary: async (req, res, next) => {
        try {
            const summary = await companyRelatedData_service_1.companyRelatedDataService.getPaymentsSummary(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Payments summary retrieved successfully.', summary);
        }
        catch (error) {
            next(error);
        }
    },
};
