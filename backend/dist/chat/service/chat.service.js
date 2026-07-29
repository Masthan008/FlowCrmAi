"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = void 0;
const chat_repository_1 = require("../repository/chat.repository");
const db_1 = require("../../database/db");
exports.chatService = {
    getConversations: async (params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (params.status) {
            where.status = params.status;
        }
        if (params.assignedToId) {
            where.assignedToId = params.assignedToId;
        }
        const [items, total] = await Promise.all([
            chat_repository_1.chatConversationRepository.findMany({
                skip,
                take: limit,
                where,
                orderBy: { startedAt: 'desc' },
            }),
            chat_repository_1.chatConversationRepository.count(where),
        ]);
        return {
            items,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    },
    getConversationById: async (id) => {
        const conversation = await chat_repository_1.chatConversationRepository.findById(id);
        if (!conversation || conversation.deletedAt) {
            throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });
        }
        return conversation;
    },
    createConversation: async (data) => {
        if (data.customerId) {
            const customer = await db_1.prisma.customer.findUnique({ where: { id: data.customerId } });
            if (!customer) {
                throw Object.assign(new Error('Customer not found'), { statusCode: 400 });
            }
        }
        return chat_repository_1.chatConversationRepository.create({
            sessionId: data.sessionId,
            visitorName: data.visitorName || null,
            visitorEmail: data.visitorEmail || null,
            visitorPhone: data.visitorPhone || null,
            pageUrl: data.pageUrl || null,
            customerId: data.customerId || null,
            companyId: data.companyId || null,
            ipAddress: data.ipAddress || null,
            userAgent: data.userAgent || null,
            status: 'Active',
        });
    },
    sendMessage: async (conversationId, data) => {
        const conversation = await chat_repository_1.chatConversationRepository.findById(conversationId);
        if (!conversation || conversation.deletedAt) {
            throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });
        }
        if (conversation.status === 'Closed') {
            throw Object.assign(new Error('Conversation is closed'), { statusCode: 400 });
        }
        return db_1.prisma.chatMessage.create({
            data: {
                conversationId,
                content: data.content,
                senderType: data.senderType || 'Visitor',
                senderId: data.senderId || null,
                contentType: data.contentType || 'Text',
                fileUrl: data.fileUrl || null,
            },
            include: {
                conversation: {
                    select: { id: true, sessionId: true, status: true },
                },
            },
        });
    },
    assignConversation: async (id, assignedToId, userId) => {
        const existing = await chat_repository_1.chatConversationRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });
        }
        const employee = await db_1.prisma.employee.findUnique({ where: { id: assignedToId } });
        if (!employee) {
            throw Object.assign(new Error('Employee not found'), { statusCode: 400 });
        }
        return chat_repository_1.chatConversationRepository.update(id, {
            assignedToId,
            updatedBy: userId || null,
        });
    },
    closeConversation: async (id, userId) => {
        const existing = await chat_repository_1.chatConversationRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });
        }
        return chat_repository_1.chatConversationRepository.update(id, {
            status: 'Closed',
            endedAt: new Date(),
            updatedBy: userId || null,
        });
    },
    rateConversation: async (id, rating, ratingComment) => {
        const existing = await chat_repository_1.chatConversationRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });
        }
        return chat_repository_1.chatConversationRepository.update(id, {
            rating,
            ratingComment: ratingComment || null,
        });
    },
};
exports.default = exports.chatService;
