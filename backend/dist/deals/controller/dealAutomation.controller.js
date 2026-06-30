"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dealAutomationController = void 0;
const dealAutomation_service_1 = require("../service/dealAutomation.service");
const response_1 = require("../../helpers/response");
exports.dealAutomationController = {
    getScore: async (req, res, next) => {
        try {
            const data = await dealAutomation_service_1.dealAutomationService.getScore(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal score calculated.', data);
        }
        catch (error) {
            next(error);
        }
    },
    getWinProbability: async (req, res, next) => {
        try {
            const data = await dealAutomation_service_1.dealAutomationService.getWinProbability(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Win probability calculated.', data);
        }
        catch (error) {
            next(error);
        }
    },
    getHealth: async (req, res, next) => {
        try {
            const data = await dealAutomation_service_1.dealAutomationService.getHealth(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Deal health metrics loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    getRisk: async (req, res, next) => {
        try {
            const data = await dealAutomation_service_1.dealAutomationService.getRisk(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Risk analysis completed.', data);
        }
        catch (error) {
            next(error);
        }
    },
    getRecommendations: async (req, res, next) => {
        try {
            const data = await dealAutomation_service_1.dealAutomationService.getRecommendations(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Recommendations generated.', data);
        }
        catch (error) {
            next(error);
        }
    },
    getSLA: async (req, res, next) => {
        try {
            const data = await dealAutomation_service_1.dealAutomationService.getSLA(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'SLA status loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    getPlaybooks: async (req, res, next) => {
        try {
            const data = await dealAutomation_service_1.dealAutomationService.getPlaybooks(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Playbooks loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    getFollowups: async (req, res, next) => {
        try {
            const data = await dealAutomation_service_1.dealAutomationService.getFollowups(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Follow-up schedules loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    createFollowup: async (req, res, next) => {
        try {
            const data = await dealAutomation_service_1.dealAutomationService.createFollowup(req.params.id, req.body, req.user?.email || 'system');
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Follow-up created successfully.', data);
        }
        catch (error) {
            next(error);
        }
    },
    updateLifecycle: async (req, res, next) => {
        try {
            const data = await dealAutomation_service_1.dealAutomationService.updateLifecycle(req.params.id, req.body);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lifecycle status updated.', data);
        }
        catch (error) {
            next(error);
        }
    },
    getExecutiveInsights: async (req, res, next) => {
        try {
            const data = await dealAutomation_service_1.dealAutomationService.getExecutiveInsights();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Executive insights loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    getWorkflows: async (req, res, next) => {
        try {
            const data = await dealAutomation_service_1.dealAutomationService.getWorkflows(req.query.module);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Workflows loaded.', data);
        }
        catch (error) {
            next(error);
        }
    },
    createWorkflow: async (req, res, next) => {
        try {
            const data = await dealAutomation_service_1.dealAutomationService.createWorkflow(req.body);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Workflow created successfully.', data);
        }
        catch (error) {
            next(error);
        }
    }
};
