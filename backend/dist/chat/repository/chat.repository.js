"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatConversationRepository = exports.ChatConversationRepository = void 0;
const db_1 = require("../../database/db");
class ChatConversationRepository {
    async findMany(params) {
        return db_1.prisma.chatConversation.findMany({
            skip: params.skip,
            take: params.take,
            where: params.where,
            orderBy: params.orderBy,
            include: {
                assignedTo: {
                    select: { id: true, firstName: true, lastName: true },
                },
                customer: {
                    select: { id: true, name: true, email: true },
                },
                company: {
                    select: { id: true, name: true },
                },
                _count: {
                    select: { messages: true },
                },
            },
        });
    }
    async count(where) {
        return db_1.prisma.chatConversation.count({ where });
    }
    async findById(id) {
        return db_1.prisma.chatConversation.findUnique({
            where: { id },
            include: {
                assignedTo: {
                    select: { id: true, firstName: true, lastName: true },
                },
                customer: {
                    select: { id: true, name: true, email: true },
                },
                company: {
                    select: { id: true, name: true },
                },
                messages: {
                    orderBy: { sentAt: 'asc' },
                },
            },
        });
    }
    async create(data) {
        return db_1.prisma.chatConversation.create({
            data,
            include: {
                assignedTo: {
                    select: { id: true, firstName: true, lastName: true },
                },
            },
        });
    }
    async update(id, data) {
        return db_1.prisma.chatConversation.update({
            where: { id },
            data,
            include: {
                assignedTo: {
                    select: { id: true, firstName: true, lastName: true },
                },
                customer: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    async softDelete(id, userId) {
        return db_1.prisma.chatConversation.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy: userId || null,
            },
        });
    }
}
exports.ChatConversationRepository = ChatConversationRepository;
exports.chatConversationRepository = new ChatConversationRepository();
exports.default = exports.chatConversationRepository;
