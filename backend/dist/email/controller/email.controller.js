"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailController = void 0;
const email_service_1 = require("../service/email.service");
const response_1 = require("../../helpers/response");
exports.emailController = {
    listAccounts: async (req, res, next) => {
        try {
            const accounts = await email_service_1.emailService.listAccounts(req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Email accounts retrieved successfully.', accounts);
        }
        catch (error) {
            next(error);
        }
    },
    addAccount: async (req, res, next) => {
        try {
            const account = await email_service_1.emailService.addAccount(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Email account added successfully.', account);
        }
        catch (error) {
            next(error);
        }
    },
    updateAccount: async (req, res, next) => {
        try {
            const account = await email_service_1.emailService.updateAccount(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Email account updated successfully.', account);
        }
        catch (error) {
            next(error);
        }
    },
    removeAccount: async (req, res, next) => {
        try {
            await email_service_1.emailService.removeAccount(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Email account removed successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    syncAccount: async (req, res, next) => {
        try {
            const result = await email_service_1.emailService.syncAccount(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Email sync initiated successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    listMessages: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const accountId = req.params.id || req.query.accountId;
            const result = await email_service_1.emailService.listMessages(accountId, { page, limit });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Messages retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getMessage: async (req, res, next) => {
        try {
            const message = await email_service_1.emailService.getMessage(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Message retrieved successfully.', message);
        }
        catch (error) {
            next(error);
        }
    },
    markAsRead: async (req, res, next) => {
        try {
            const message = await email_service_1.emailService.markAsRead(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Message marked as read successfully.', message);
        }
        catch (error) {
            next(error);
        }
    },
    toggleStar: async (req, res, next) => {
        try {
            const message = await email_service_1.emailService.toggleStar(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Message star toggled successfully.', message);
        }
        catch (error) {
            next(error);
        }
    },
    send: async (req, res, next) => {
        try {
            const result = await email_service_1.emailService.sendEmail(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Email sent successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.emailController;
