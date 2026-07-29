"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.knowledgeController = void 0;
const knowledge_service_1 = require("../service/knowledge.service");
const response_1 = require("../../helpers/response");
exports.knowledgeController = {
    list: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const search = req.query.search;
            const category = req.query.category;
            const status = req.query.status;
            const tags = req.query.tags;
            const result = await knowledge_service_1.knowledgeService.getArticles({ page, limit, search, category, status, tags });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Articles retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const article = await knowledge_service_1.knowledgeService.getArticleById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Article details retrieved successfully.', article);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const article = await knowledge_service_1.knowledgeService.createArticle(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Article created successfully.', article);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const article = await knowledge_service_1.knowledgeService.updateArticle(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Article updated successfully.', article);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await knowledge_service_1.knowledgeService.deleteArticle(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Article deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    publish: async (req, res, next) => {
        try {
            const article = await knowledge_service_1.knowledgeService.updateArticleStatus(req.params.id, 'Published', req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Article published successfully.', article);
        }
        catch (error) {
            next(error);
        }
    },
    archive: async (req, res, next) => {
        try {
            const article = await knowledge_service_1.knowledgeService.updateArticleStatus(req.params.id, 'Archived', req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Article archived successfully.', article);
        }
        catch (error) {
            next(error);
        }
    },
    vote: async (req, res, next) => {
        try {
            const result = await knowledge_service_1.knowledgeService.voteArticle(req.params.id, req.body.helpful, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Vote recorded successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getCategories: async (req, res, next) => {
        try {
            const categories = await knowledge_service_1.knowledgeService.getCategories();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Categories retrieved successfully.', categories);
        }
        catch (error) {
            next(error);
        }
    },
    createCategory: async (req, res, next) => {
        try {
            const category = await knowledge_service_1.knowledgeService.createCategory(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Category created successfully.', category);
        }
        catch (error) {
            next(error);
        }
    },
    updateCategory: async (req, res, next) => {
        try {
            const category = await knowledge_service_1.knowledgeService.updateCategory(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Category updated successfully.', category);
        }
        catch (error) {
            next(error);
        }
    },
    deleteCategory: async (req, res, next) => {
        try {
            await knowledge_service_1.knowledgeService.deleteCategory(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Category deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.knowledgeController;
