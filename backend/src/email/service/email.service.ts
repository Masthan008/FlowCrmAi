import { prisma } from '../../database/db';

export const emailService = {
  listAccounts: async (userId?: string) => {
    return prisma.emailAccount.findMany({
      where: { deletedAt: null, ...(userId ? { userId } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  },

  getAccounts: async (userId?: string) => {
    return prisma.emailAccount.findMany({
      where: { deletedAt: null, ...(userId ? { userId } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  },

  getAccountById: async (id: string) => {
    const account = await prisma.emailAccount.findUnique({ where: { id } });
    if (!account || account.deletedAt) {
      throw Object.assign(new Error('Email account not found'), { statusCode: 404 });
    }
    return account;
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
    let uid = userId;
    if (!uid) {
      const u = await prisma.user.findFirst();
      uid = u?.id || '00000000-0000-0000-0000-000000000000';
    }
    return prisma.emailAccount.create({
      data: {
        userId: uid,
        email: data.email,
        provider: data.provider || 'IMAP',
        createdBy: userId || null,
      },
    });
  },

  createAccount: async (
    data: {
      email: string;
      displayName?: string;
      provider?: string;
      isDefault?: boolean;
    },
    userId?: string
  ) => {
    let uid = userId;
    if (!uid) {
      const u = await prisma.user.findFirst();
      uid = u?.id || '00000000-0000-0000-0000-000000000000';
    }
    return prisma.emailAccount.create({
      data: {
        userId: uid,
        email: data.email,
        provider: data.provider || 'IMAP',
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
      data: { provider: data.provider || existing.provider, updatedBy: userId || null },
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

  deleteAccount: async (id: string, userId?: string) => {
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
    return { synced: true, accountId: id, lastSyncedAt: new Date() };
  },

  listMessages: async (accountId?: string, params?: { page?: number; limit?: number }) => {
    const page = params?.page || 1;
    const limit = params?.limit || 25;
    const skip = (page - 1) * limit;

    const where: any = { deletedAt: null, ...(accountId ? { accountId } : {}) };

    const [items, total] = await Promise.all([
      prisma.emailMessage.findMany({
        where,
        skip,
        take: limit,
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
    const message = await prisma.emailMessage.findUnique({ where: { id } });
    if (!message || message.deletedAt) {
      throw Object.assign(new Error('Message not found'), { statusCode: 404 });
    }
    return message;
  },

  markAsRead: async (id: string) => {
    return prisma.emailMessage.update({
      where: { id },
      data: { isRead: true },
    });
  },

  toggleStar: async (id: string) => {
    const msg = await prisma.emailMessage.findUnique({ where: { id } });
    if (!msg) throw Object.assign(new Error('Message not found'), { statusCode: 404 });
    return prisma.emailMessage.update({
      where: { id },
      data: { isStarred: !msg.isStarred },
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

export default emailService;
