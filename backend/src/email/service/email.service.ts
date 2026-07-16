import { emailRepository } from '../repository/email.repository';
import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export const emailService = {
  listAccounts: async (userId?: string) => {
    return prisma.emailAccount.findMany({
      where: { deletedAt: null },
      orderBy: { email: 'asc' },
    });
  },

  addAccount: async (
    data: {
      email: string;
      displayName?: string;
      provider?: string;
      isDefault?: boolean;
    },
    userId?: string
  ) => {
    return prisma.emailAccount.create({
      data: {
        email: data.email,
        displayName: data.displayName,
        provider: data.provider || 'other',
        isDefault: data.isDefault || false,
        createdBy: userId || null,
      },
    });
  },

  updateAccount: async (
    id: string,
    data: { displayName?: string; provider?: string; isDefault?: boolean },
    userId?: string
  ) => {
    const existing = await prisma.emailAccount.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Email account not found'), { statusCode: 404 });
    }
    return prisma.emailAccount.update({
      where: { id },
      data: { ...data, updatedBy: userId || null },
    });
  },

  removeAccount: async (id: string, userId?: string) => {
    const existing = await prisma.emailAccount.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Email account not found'), { statusCode: 404 });
    }
    return prisma.emailAccount.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: userId || null },
    });
  },

  syncAccount: async (id: string, userId?: string) => {
    const existing = await prisma.emailAccount.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Email account not found'), { statusCode: 404 });
    }
    return prisma.emailAccount.update({
      where: { id },
      data: { lastSyncedAt: new Date(), updatedBy: userId || null },
    });
  },

  listMessages: async (
    accountId: string,
    params: { page?: number; limit?: number }
  ) => {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.EmailMessageWhereInput = {
      accountId,
      deletedAt: null,
    };

    const [items, total] = await Promise.all([
      prisma.emailMessage.findMany({
        skip,
        take: limit,
        where,
        orderBy: { receivedAt: 'desc' },
      }),
      prisma.emailMessage.count({ where }),
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

  getMessage: async (id: string) => {
    const message = await prisma.emailMessage.findUnique({
      where: { id },
    });
    if (!message || message.deletedAt) {
      throw Object.assign(new Error('Message not found'), { statusCode: 404 });
    }
    return message;
  },

  markAsRead: async (id: string) => {
    const message = await prisma.emailMessage.findUnique({ where: { id } });
    if (!message || message.deletedAt) {
      throw Object.assign(new Error('Message not found'), { statusCode: 404 });
    }
    return prisma.emailMessage.update({
      where: { id },
      data: { isRead: true },
    });
  },

  toggleStar: async (id: string) => {
    const message = await prisma.emailMessage.findUnique({ where: { id } });
    if (!message || message.deletedAt) {
      throw Object.assign(new Error('Message not found'), { statusCode: 404 });
    }
    return prisma.emailMessage.update({
      where: { id },
      data: { isStarred: !message.isStarred },
    });
  },

  sendEmail: async (
    data: {
      accountId: string;
      to: string[];
      cc?: string[];
      bcc?: string[];
      subject: string;
      body: string;
    },
    userId?: string
  ) => {
    const account = await prisma.emailAccount.findUnique({ where: { id: data.accountId } });
    if (!account || account.deletedAt) {
      throw Object.assign(new Error('Email account not found'), { statusCode: 400 });
    }

    return prisma.emailMessage.create({
      data: {
        accountId: data.accountId,
        from: account.email,
        to: data.to,
        cc: data.cc || [],
        bcc: data.bcc || [],
        subject: data.subject,
        body: data.body,
        direction: 'sent',
        isRead: true,
        receivedAt: new Date(),
        createdBy: userId || null,
      },
    });
  },
};

export default emailService;
