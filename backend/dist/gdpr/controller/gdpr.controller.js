"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gdprController = void 0;
const gdpr_service_1 = require("../service/gdpr.service");
const response_1 = require("../../helpers/response");
exports.gdprController = {
    listConsentLogs: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const contactId = req.query.contactId;
            const companyId = req.query.companyId;
            const type = req.query.type;
            const result = await gdpr_service_1.gdprService.getConsentLogs({ page, limit, contactId, companyId, type });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Consent logs retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    recordConsent: async (req, res, next) => {
        try {
            const log = await gdpr_service_1.gdprService.recordConsent(req.body);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Consent recorded successfully.', log);
        }
        catch (error) {
            next(error);
        }
    },
    revokeConsent: async (req, res, next) => {
        try {
            const log = await gdpr_service_1.gdprService.revokeConsent(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Consent revoked successfully.', log);
        }
        catch (error) {
            next(error);
        }
    },
    listDataRequests: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const type = req.query.type;
            const status = req.query.status;
            const result = await gdpr_service_1.gdprService.getDataRequests({ page, limit, type, status });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Data requests retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    createDataRequest: async (req, res, next) => {
        try {
            const request = await gdpr_service_1.gdprService.createDataRequest(req.body);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Data request created successfully.', request);
        }
        catch (error) {
            next(error);
        }
    },
    processDataRequest: async (req, res, next) => {
        try {
            const request = await gdpr_service_1.gdprService.processDataRequest(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Data request processing started.', request);
        }
        catch (error) {
            next(error);
        }
    },
    completeDataRequest: async (req, res, next) => {
        try {
            const request = await gdpr_service_1.gdprService.completeDataRequest(req.params.id, req.body.responseData);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Data request completed successfully.', request);
        }
        catch (error) {
            next(error);
        }
    },
    rejectDataRequest: async (req, res, next) => {
        try {
            const request = await gdpr_service_1.gdprService.rejectDataRequest(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Data request rejected.', request);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.gdprController;
