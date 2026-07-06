"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceController = void 0;
const invoice_service_1 = require("../service/invoice.service");
const response_1 = require("../../helpers/response");
exports.invoiceController = {
    list: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const search = req.query.search;
            const status = req.query.status;
            const customerId = req.query.customerId;
            const dealId = req.query.dealId;
            const result = await invoice_service_1.invoiceService.getInvoices({ page, limit, search, status, customerId, dealId });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Invoices retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const invoice = await invoice_service_1.invoiceService.getInvoiceById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Invoice details retrieved successfully.', invoice);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const invoice = await invoice_service_1.invoiceService.createInvoice(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Invoice created successfully.', invoice);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const invoice = await invoice_service_1.invoiceService.updateInvoice(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Invoice updated successfully.', invoice);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await invoice_service_1.invoiceService.deleteInvoice(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Invoice deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    recordPayment: async (req, res, next) => {
        try {
            const payment = await invoice_service_1.invoiceService.recordPayment(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Payment recorded successfully.', payment);
        }
        catch (error) {
            next(error);
        }
    },
    getPayments: async (req, res, next) => {
        try {
            const payments = await invoice_service_1.invoiceService.getInvoicePayments(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Invoice payments retrieved successfully.', payments);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.invoiceController;
