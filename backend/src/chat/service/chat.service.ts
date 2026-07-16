import { chatConversationRepository } from '../repository/chat.repository';
import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export const chatService = {
  getConversations: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    assignedToId?: string;
  }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ChatConversationWhereInput = {
      deletedAt: null,
    };

    if (params.status) {
      where.status = params.status;
    }

    if (params.assignedToId) {
      where.assignedToId = params.assignedToId;
    }

    const [items, total] = await Promise.all([
      chatConversationRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { startedAt: 'desc' },
      }),
      chatConversationRepository.count(where),
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

  getConversationById: async (id: string) => {
    const conversation = await chatConversationRepository.findById(id);
    if (!conversation || conversation.deletedAt) {
      throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });
    }
    return conversation;
  },

  createConversation: async (data: {
    sessionId: string;
    visitorName?: string | null;
    visitorEmail?: string | null;
    visitorPhone?: string | null;
    pageUrl?: string | null;
    customerId?: string | null;
    companyId?: string | null;
    ipAddress?: string;
    userAgent?: string;
  }) => {
    if (data.customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
      if (!customer) {
        throw Object.assign(new Error('Customer not found'), { statusCode: 400 });
      }
    }

    return chatConversationRepository.create({
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

  sendMessage: async (
    conversationId: string,
    data: {
      content: string;
      senderType?: string;
      senderId?: string | null;
      contentType?: string;
      fileUrl?: string | null;
    }
  ) => {
    const conversation = await chatConversationRepository.findById(conversationId);
    if (!conversation || conversation.deletedAt) {
      throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });
    }

    if (conversation.status === 'Closed') {
      throw Object.assign(new Error('Conversation is closed'), { statusCode: 400 });
    }

    return prisma.chatMessage.create({
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

  assignConversation: async (id: string, assignedToId: string, userId?: string) => {
    const existing = await chatConversationRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });
    }

    const employee = await prisma.employee.findUnique({ where: { id: assignedToId } });
    if (!employee) {
      throw Object.assign(new Error('Employee not found'), { statusCode: 400 });
    }

    return chatConversationRepository.update(id, {
      assignedToId,
      updatedBy: userId || null,
    });
  },

  closeConversation: async (id: string, userId?: string) => {
    const existing = await chatConversationRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });
    }

    return chatConversationRepository.update(id, {
      status: 'Closed',
      endedAt: new Date(),
      updatedBy: userId || null,
    });
  },

  rateConversation: async (id: string, rating: number, ratingComment?: string | null) => {
    const existing = await chatConversationRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Conversation not found'), { statusCode: 404 });
    }

    return chatConversationRepository.update(id, {
      rating,
      ratingComment: ratingComment || null,
    });
  },
};

export default chatService;
