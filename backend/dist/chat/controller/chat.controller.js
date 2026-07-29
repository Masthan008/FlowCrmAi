"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = void 0;
const chat_service_1 = require("../service/chat.service");
const response_1 = require("../../helpers/response");
exports.chatController = {
    list: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const status = req.query.status;
            const assignedToId = req.query.assignedToId;
            const result = await chat_service_1.chatService.getConversations({ page, limit, status, assignedToId });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Conversations retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const conversation = await chat_service_1.chatService.getConversationById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Conversation details retrieved successfully.', conversation);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const conversation = await chat_service_1.chatService.createConversation({
                ...req.body,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Conversation created successfully.', conversation);
        }
        catch (error) {
            next(error);
        }
    },
    sendMessage: async (req, res, next) => {
        try {
            const message = await chat_service_1.chatService.sendMessage(req.params.id, req.body);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Message sent successfully.', message);
        }
        catch (error) {
            next(error);
        }
    },
    assign: async (req, res, next) => {
        try {
            const conversation = await chat_service_1.chatService.assignConversation(req.params.id, req.body.assignedToId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Conversation assigned successfully.', conversation);
        }
        catch (error) {
            next(error);
        }
    },
    close: async (req, res, next) => {
        try {
            const conversation = await chat_service_1.chatService.closeConversation(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Conversation closed successfully.', conversation);
        }
        catch (error) {
            next(error);
        }
    },
    rate: async (req, res, next) => {
        try {
            const conversation = await chat_service_1.chatService.rateConversation(req.params.id, req.body.rating, req.body.ratingComment);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Conversation rated successfully.', conversation);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.chatController;
