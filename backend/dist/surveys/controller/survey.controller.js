"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.surveyController = void 0;
const survey_service_1 = require("../service/survey.service");
const response_1 = require("../../helpers/response");
exports.surveyController = {
    list: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const search = req.query.search;
            const status = req.query.status;
            const result = await survey_service_1.surveyService.getSurveys({ page, limit, search, status });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Surveys retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const survey = await survey_service_1.surveyService.getSurveyById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Survey details retrieved successfully.', survey);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const survey = await survey_service_1.surveyService.createSurvey(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Survey created successfully.', survey);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const survey = await survey_service_1.surveyService.updateSurvey(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Survey updated successfully.', survey);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await survey_service_1.surveyService.deleteSurvey(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Survey deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    activate: async (req, res, next) => {
        try {
            const survey = await survey_service_1.surveyService.activateSurvey(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Survey activated successfully.', survey);
        }
        catch (error) {
            next(error);
        }
    },
    close: async (req, res, next) => {
        try {
            const survey = await survey_service_1.surveyService.closeSurvey(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Survey closed successfully.', survey);
        }
        catch (error) {
            next(error);
        }
    },
    getResponses: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const result = await survey_service_1.surveyService.getResponses(req.params.id, { page, limit });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Survey responses retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getAnalytics: async (req, res, next) => {
        try {
            const analytics = await survey_service_1.surveyService.getAnalytics(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Survey analytics retrieved successfully.', analytics);
        }
        catch (error) {
            next(error);
        }
    },
    submitPublic: async (req, res, next) => {
        try {
            const response = await survey_service_1.surveyService.submitPublic(req.params.id, req.body, req.ip);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Survey response submitted successfully.', response);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.surveyController;
