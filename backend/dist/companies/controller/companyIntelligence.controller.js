"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyIntelligenceController = void 0;
const companyIntelligence_service_1 = require("../service/companyIntelligence.service");
const response_1 = require("../../helpers/response");
exports.companyIntelligenceController = {
    getLifecycle: async (req, res, next) => {
        try {
            const lifecycle = await companyIntelligence_service_1.companyIntelligenceService.getLifecycle(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lifecycle retrieved successfully.', lifecycle);
        }
        catch (error) {
            next(error);
        }
    },
    updateLifecycle: async (req, res, next) => {
        try {
            const lifecycle = await companyIntelligence_service_1.companyIntelligenceService.updateLifecycle(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Lifecycle updated successfully.', lifecycle);
        }
        catch (error) {
            next(error);
        }
    },
    getStageHistory: async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const history = await companyIntelligence_service_1.companyIntelligenceService.getStageHistory(req.params.id, page, limit);
            const { items, totalItems, totalPages } = history;
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Stage history retrieved successfully.', items, {
                page, limit, totalItems, totalPages,
            });
        }
        catch (error) {
            next(error);
        }
    },
    getScore: async (req, res, next) => {
        try {
            const score = await companyIntelligence_service_1.companyIntelligenceService.getScore(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Score retrieved successfully.', score);
        }
        catch (error) {
            next(error);
        }
    },
    calculateScore: async (req, res, next) => {
        try {
            const score = await companyIntelligence_service_1.companyIntelligenceService.calculateScore(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Score calculated successfully.', score);
        }
        catch (error) {
            next(error);
        }
    },
    getHealth: async (req, res, next) => {
        try {
            const health = await companyIntelligence_service_1.companyIntelligenceService.getHealth(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Health retrieved successfully.', health);
        }
        catch (error) {
            next(error);
        }
    },
    calculateHealth: async (req, res, next) => {
        try {
            const health = await companyIntelligence_service_1.companyIntelligenceService.calculateHealth(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Health calculated successfully.', health);
        }
        catch (error) {
            next(error);
        }
    },
    getRisk: async (req, res, next) => {
        try {
            const risk = await companyIntelligence_service_1.companyIntelligenceService.getRisk(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Risk retrieved successfully.', risk);
        }
        catch (error) {
            next(error);
        }
    },
    calculateRisk: async (req, res, next) => {
        try {
            const risk = await companyIntelligence_service_1.companyIntelligenceService.calculateRisk(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Risk calculated successfully.', risk);
        }
        catch (error) {
            next(error);
        }
    },
    listSegments: async (req, res, next) => {
        try {
            const params = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
                search: req.query.search,
                isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
            };
            const result = await companyIntelligence_service_1.companyIntelligenceService.listSegments(params);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Segments retrieved successfully.', result.items, {
                page: result.page, limit: result.limit, totalItems: result.totalItems, totalPages: result.totalPages,
            });
        }
        catch (error) {
            next(error);
        }
    },
    createSegment: async (req, res, next) => {
        try {
            const segment = await companyIntelligence_service_1.companyIntelligenceService.createSegment(req.body);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Segment created successfully.', segment);
        }
        catch (error) {
            next(error);
        }
    },
    getSegment: async (req, res, next) => {
        try {
            const segment = await companyIntelligence_service_1.companyIntelligenceService.getSegment(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Segment retrieved successfully.', segment);
        }
        catch (error) {
            next(error);
        }
    },
    updateSegment: async (req, res, next) => {
        try {
            const segment = await companyIntelligence_service_1.companyIntelligenceService.updateSegment(req.params.id, req.body);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Segment updated successfully.', segment);
        }
        catch (error) {
            next(error);
        }
    },
    deleteSegment: async (req, res, next) => {
        try {
            await companyIntelligence_service_1.companyIntelligenceService.deleteSegment(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Segment deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    evaluateSegment: async (req, res, next) => {
        try {
            const companies = await companyIntelligence_service_1.companyIntelligenceService.evaluateSegment(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Segment evaluated successfully.', companies);
        }
        catch (error) {
            next(error);
        }
    },
    listTags: async (req, res, next) => {
        try {
            const params = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
                search: req.query.search,
                isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
            };
            const result = await companyIntelligence_service_1.companyIntelligenceService.listTags(params);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Tags retrieved successfully.', result.items, {
                page: result.page, limit: result.limit, totalItems: result.totalItems, totalPages: result.totalPages,
            });
        }
        catch (error) {
            next(error);
        }
    },
    createTag: async (req, res, next) => {
        try {
            const tag = await companyIntelligence_service_1.companyIntelligenceService.createTag(req.body);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Tag created successfully.', tag);
        }
        catch (error) {
            next(error);
        }
    },
    updateTag: async (req, res, next) => {
        try {
            const tag = await companyIntelligence_service_1.companyIntelligenceService.updateTag(req.params.id, req.body);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Tag updated successfully.', tag);
        }
        catch (error) {
            next(error);
        }
    },
    deleteTag: async (req, res, next) => {
        try {
            await companyIntelligence_service_1.companyIntelligenceService.deleteTag(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Tag deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    getCompanyTags: async (req, res, next) => {
        try {
            const tags = await companyIntelligence_service_1.companyIntelligenceService.getCompanyTags(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Company tags retrieved successfully.', tags);
        }
        catch (error) {
            next(error);
        }
    },
    assignTagsToCompany: async (req, res, next) => {
        try {
            const tags = await companyIntelligence_service_1.companyIntelligenceService.assignTagsToCompany(req.params.id, req.body.tagIds, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Tags assigned successfully.', tags);
        }
        catch (error) {
            next(error);
        }
    },
    removeTagFromCompany: async (req, res, next) => {
        try {
            await companyIntelligence_service_1.companyIntelligenceService.removeTagFromCompany(req.params.id, req.params.tagId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Tag removed from company successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    listWorkflows: async (req, res, next) => {
        try {
            const params = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
                search: req.query.search,
                triggerType: req.query.triggerType,
            };
            const result = await companyIntelligence_service_1.companyIntelligenceService.listWorkflows(params);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Workflows retrieved successfully.', result.items, {
                page: result.page, limit: result.limit, totalItems: result.totalItems, totalPages: result.totalPages,
            });
        }
        catch (error) {
            next(error);
        }
    },
    createWorkflow: async (req, res, next) => {
        try {
            const workflow = await companyIntelligence_service_1.companyIntelligenceService.createWorkflow(req.body);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Workflow created successfully.', workflow);
        }
        catch (error) {
            next(error);
        }
    },
    updateWorkflow: async (req, res, next) => {
        try {
            const workflow = await companyIntelligence_service_1.companyIntelligenceService.updateWorkflow(req.params.id, req.body);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Workflow updated successfully.', workflow);
        }
        catch (error) {
            next(error);
        }
    },
    deleteWorkflow: async (req, res, next) => {
        try {
            await companyIntelligence_service_1.companyIntelligenceService.deleteWorkflow(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Workflow deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    listRecommendations: async (req, res, next) => {
        try {
            const params = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
                type: req.query.type,
                priority: req.query.priority,
                isRead: req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined,
                isActioned: req.query.isActioned !== undefined ? req.query.isActioned === 'true' : undefined,
            };
            const result = await companyIntelligence_service_1.companyIntelligenceService.listRecommendations(req.params.id, params);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Recommendations retrieved successfully.', result.items, {
                page: result.page, limit: result.limit, totalItems: result.totalItems, totalPages: result.totalPages,
            });
        }
        catch (error) {
            next(error);
        }
    },
    createRecommendation: async (req, res, next) => {
        try {
            const recommendation = await companyIntelligence_service_1.companyIntelligenceService.createRecommendation({
                ...req.body,
                companyId: req.params.id,
            });
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Recommendation created successfully.', recommendation);
        }
        catch (error) {
            next(error);
        }
    },
    markRecommendationRead: async (req, res, next) => {
        try {
            const recommendation = await companyIntelligence_service_1.companyIntelligenceService.markRecommendationRead(req.params.recId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Recommendation marked as read.', recommendation);
        }
        catch (error) {
            next(error);
        }
    },
    markRecommendationActioned: async (req, res, next) => {
        try {
            const recommendation = await companyIntelligence_service_1.companyIntelligenceService.markRecommendationActioned(req.params.recId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Recommendation marked as actioned.', recommendation);
        }
        catch (error) {
            next(error);
        }
    },
    listFollowups: async (req, res, next) => {
        try {
            const params = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 20,
                status: req.query.status,
                type: req.query.type,
                priority: req.query.priority,
            };
            const result = await companyIntelligence_service_1.companyIntelligenceService.listFollowups(req.params.id, params);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Follow-ups retrieved successfully.', result.items, {
                page: result.page, limit: result.limit, totalItems: result.totalItems, totalPages: result.totalPages,
            });
        }
        catch (error) {
            next(error);
        }
    },
    createFollowup: async (req, res, next) => {
        try {
            const followup = await companyIntelligence_service_1.companyIntelligenceService.createFollowup({
                ...req.body,
                companyId: req.params.id,
                dueDate: new Date(req.body.dueDate),
            });
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Follow-up created successfully.', followup);
        }
        catch (error) {
            next(error);
        }
    },
    updateFollowup: async (req, res, next) => {
        try {
            const data = { ...req.body };
            if (data.dueDate)
                data.dueDate = new Date(data.dueDate);
            const followup = await companyIntelligence_service_1.companyIntelligenceService.updateFollowup(req.params.followupId, data);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Follow-up updated successfully.', followup);
        }
        catch (error) {
            next(error);
        }
    },
    deleteFollowup: async (req, res, next) => {
        try {
            await companyIntelligence_service_1.companyIntelligenceService.deleteFollowup(req.params.followupId);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Follow-up deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    getInsights: async (req, res, next) => {
        try {
            const insights = await companyIntelligence_service_1.companyIntelligenceService.getInsights();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Insights retrieved successfully.', insights);
        }
        catch (error) {
            next(error);
        }
    },
    getAnalytics: async (req, res, next) => {
        try {
            const params = {
                period: req.query.period || 'monthly',
                year: parseInt(req.query.year) || new Date().getFullYear(),
            };
            const analytics = await companyIntelligence_service_1.companyIntelligenceService.getAnalytics(params);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Analytics retrieved successfully.', analytics);
        }
        catch (error) {
            next(error);
        }
    },
};
