"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webFormController = void 0;
const webform_service_1 = require("../service/webform.service");
const response_1 = require("../../helpers/response");
exports.webFormController = {
    list: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const search = req.query.search;
            const result = await webform_service_1.webFormService.getWebForms({ page, limit, search });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Web forms retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const form = await webform_service_1.webFormService.getWebFormById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Web form details retrieved successfully.', form);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const form = await webform_service_1.webFormService.createWebForm(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Web form created successfully.', form);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const form = await webform_service_1.webFormService.updateWebForm(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Web form updated successfully.', form);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await webform_service_1.webFormService.deleteWebForm(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Web form deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    activate: async (req, res, next) => {
        try {
            const form = await webform_service_1.webFormService.activateForm(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Web form activated successfully.', form);
        }
        catch (error) {
            next(error);
        }
    },
    deactivate: async (req, res, next) => {
        try {
            const form = await webform_service_1.webFormService.deactivateForm(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Web form deactivated successfully.', form);
        }
        catch (error) {
            next(error);
        }
    },
    getSubmissions: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const result = await webform_service_1.webFormService.getSubmissions(req.params.id, { page, limit });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Submissions retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getEmbedCode: async (req, res, next) => {
        try {
            const result = await webform_service_1.webFormService.getEmbedCode(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Embed code generated successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    submitPublic: async (req, res, next) => {
        try {
            const submission = await webform_service_1.webFormService.submitPublic(req.params.id, req.body, req.ip, req.headers['user-agent']);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Form submitted successfully.', submission);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.webFormController;
