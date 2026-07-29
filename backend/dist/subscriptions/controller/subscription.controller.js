"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionController = void 0;
const subscription_service_1 = require("../service/subscription.service");
const response_1 = require("../../helpers/response");
exports.subscriptionController = {
    listPlans: async (req, res, next) => {
        try {
            const plans = await subscription_service_1.subscriptionService.listPlans();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Plans retrieved successfully.', plans);
        }
        catch (error) {
            next(error);
        }
    },
    createPlan: async (req, res, next) => {
        try {
            const plan = await subscription_service_1.subscriptionService.createPlan(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Plan created successfully.', plan);
        }
        catch (error) {
            next(error);
        }
    },
    updatePlan: async (req, res, next) => {
        try {
            const plan = await subscription_service_1.subscriptionService.updatePlan(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Plan updated successfully.', plan);
        }
        catch (error) {
            next(error);
        }
    },
    deletePlan: async (req, res, next) => {
        try {
            await subscription_service_1.subscriptionService.deletePlan(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Plan deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    list: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const status = req.query.status;
            const customerId = req.query.customerId;
            const planId = req.query.planId;
            const result = await subscription_service_1.subscriptionService.getSubscriptions({ page, limit, status, customerId, planId });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Subscriptions retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const subscription = await subscription_service_1.subscriptionService.getSubscriptionById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Subscription details retrieved successfully.', subscription);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const subscription = await subscription_service_1.subscriptionService.createSubscription(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Subscription created successfully.', subscription);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const subscription = await subscription_service_1.subscriptionService.updateSubscription(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Subscription updated successfully.', subscription);
        }
        catch (error) {
            next(error);
        }
    },
    cancel: async (req, res, next) => {
        try {
            await subscription_service_1.subscriptionService.cancelSubscription(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Subscription cancelled successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    pause: async (req, res, next) => {
        try {
            const subscription = await subscription_service_1.subscriptionService.updateSubscriptionStatus(req.params.id, 'Paused', req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Subscription paused successfully.', subscription);
        }
        catch (error) {
            next(error);
        }
    },
    resume: async (req, res, next) => {
        try {
            const subscription = await subscription_service_1.subscriptionService.updateSubscriptionStatus(req.params.id, 'Active', req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Subscription resumed successfully.', subscription);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.subscriptionController;
