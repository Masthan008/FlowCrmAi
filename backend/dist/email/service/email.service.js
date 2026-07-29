"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const db_1 = require("../../database/db");
exports.emailService = {
    listAccounts: async (userId) => {
        return db_1.prisma.emailAccount.findMany({
            where: { deletedAt: null, ...(userId ? { userId } : {}) },
            orderBy: { createdAt: 'desc' },
        });
    },
    getAccounts: async (userId) => {
        return db_1.prisma.emailAccount.findMany({
            where: { deletedAt: null, ...(userId ? { userId } : {}) },
            orderBy: { createdAt: 'desc' },
        });
    },
    getAccountById: async (id) => {
        const account = await db_1.prisma.emailAccount.findUnique({ where: { id } });
        if (!account || account.deletedAt) {
            throw Object.assign(new Error('Email account not found'), { statusCode: 404 });
        }
        return account;
    },
    addAccount: async (data, userId) => {
        let uid = userId;
        if (!uid) {
            const u = await db_1.prisma.user.findFirst();
            uid = u?.id || '00000000-0000-0000-0000-000000000000';
        }
        return db_1.prisma.emailAccount.create({
            data: {
                userId: uid,
                email: data.email,
                provider: data.provider || 'IMAP',
                createdBy: userId || null,
            },
        });
    },
    createAccount: async (data, userId) => {
        let uid = userId;
        if (!uid) {
            const u = await db_1.prisma.user.findFirst();
            uid = u?.id || '00000000-0000-0000-0000-000000000000';
        }
        return db_1.prisma.emailAccount.create({
            data: {
                userId: uid,
                email: data.email,
                provider: data.provider || 'IMAP',
                createdBy: userId || null,
            },
        });
    },
    updateAccount: async (id, data, userId) => {
        const existing = await db_1.prisma.emailAccount.findUnique({ where: { id } });
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Email account not found'), { statusCode: 404 });
        }
        return db_1.prisma.emailAccount.update({
            where: { id },
            data: { provider: data.provider || existing.provider, updatedBy: userId || null },
        });
    },
    removeAccount: async (id, userId) => {
        const existing = await db_1.prisma.emailAccount.findUnique({ where: { id } });
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Email account not found'), { statusCode: 404 });
        }
        return db_1.prisma.emailAccount.update({
            where: { id },
            data: { deletedAt: new Date(), deletedBy: userId || null },
        });
    },
    deleteAccount: async (id, userId) => {
        const existing = await db_1.prisma.emailAccount.findUnique({ where: { id } });
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Email account not found'), { statusCode: 404 });
        }
        return db_1.prisma.emailAccount.update({
            where: { id },
            data: { deletedAt: new Date(), deletedBy: userId || null },
        });
    },
    syncAccount: async (id, userId) => {
        return { synced: true, accountId: id, lastSyncedAt: new Date() };
    },
    listMessages: async (accountId, params) => {
        const page = params?.page || 1;
        const limit = params?.limit || 25;
        const skip = (page - 1) * limit;
        const where = { deletedAt: null, ...(accountId ? { accountId } : {}) };
        const [items, total] = await Promise.all([
            db_1.prisma.emailMessage.findMany({
                where,
                skip,
                take: limit,
                orderBy: { receivedAt: 'desc' },
            }),
            db_1.prisma.emailMessage.count({ where }),
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
    getMessage: async (id) => {
        const message = await db_1.prisma.emailMessage.findUnique({ where: { id } });
        if (!message || message.deletedAt) {
            throw Object.assign(new Error('Message not found'), { statusCode: 404 });
        }
        return message;
    },
    markAsRead: async (id) => {
        return db_1.prisma.emailMessage.update({
            where: { id },
            data: { isRead: true },
        });
    },
    toggleStar: async (id) => {
        const msg = await db_1.prisma.emailMessage.findUnique({ where: { id } });
        if (!msg)
            throw Object.assign(new Error('Message not found'), { statusCode: 404 });
        return db_1.prisma.emailMessage.update({
            where: { id },
            data: { isStarred: !msg.isStarred },
        });
    },
    sendEmail: async (data, userId) => {
        const account = await db_1.prisma.emailAccount.findUnique({ where: { id: data.accountId } });
        if (!account || account.deletedAt) {
            throw Object.assign(new Error('Email account not found'), { statusCode: 400 });
        }
        return db_1.prisma.emailMessage.create({
            data: {
                accountId: data.accountId,
                messageId: `msg-${Date.now()}`,
                fromAddress: account.email,
                toAddresses: data.to,
                ccAddresses: data.cc || [],
                bccAddresses: data.bcc || [],
                subject: data.subject,
                bodyHtml: data.body,
                folder: 'SENT',
                isRead: true,
                receivedAt: new Date(),
                createdBy: userId || null,
            },
        });
    },
};
exports.default = exports.emailService;
