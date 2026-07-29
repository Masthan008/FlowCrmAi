"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.portalController = void 0;
const portal_service_1 = require("../service/portal.service");
const response_1 = require("../../helpers/response");
exports.portalController = {
    listUsers: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const search = req.query.search;
            const result = await portal_service_1.portalService.getPortalUsers({ page, limit, search });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Portal users retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getUserById: async (req, res, next) => {
        try {
            const user = await portal_service_1.portalService.getPortalUserById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Portal user details retrieved successfully.', user);
        }
        catch (error) {
            next(error);
        }
    },
    createUser: async (req, res, next) => {
        try {
            const user = await portal_service_1.portalService.createPortalUser(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Portal user created successfully.', user);
        }
        catch (error) {
            next(error);
        }
    },
    updateUser: async (req, res, next) => {
        try {
            const user = await portal_service_1.portalService.updatePortalUser(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Portal user updated successfully.', user);
        }
        catch (error) {
            next(error);
        }
    },
    deleteUser: async (req, res, next) => {
        try {
            await portal_service_1.portalService.deletePortalUser(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Portal user deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    login: async (req, res, next) => {
        try {
            const result = await portal_service_1.portalService.login(req.body.email, req.body.password);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Login successful.', result);
        }
        catch (error) {
            next(error);
        }
    },
    register: async (req, res, next) => {
        try {
            const user = await portal_service_1.portalService.register(req.body);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Registration successful.', user);
        }
        catch (error) {
            next(error);
        }
    },
    getProfile: async (req, res, next) => {
        try {
            const user = await portal_service_1.portalService.getProfile(req.user?.id || '');
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Profile retrieved successfully.', user);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.portalController;
