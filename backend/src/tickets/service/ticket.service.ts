import { ticketRepository } from '../repository/ticket.repository';
import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export const ticketService = {
  getTickets: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: string;
  }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.TicketWhereInput = {
      deletedAt: null,
    };

    if (params.search) {
      where.subject = { contains: params.search, mode: 'insensitive' };
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.priority) {
      where.priority = params.priority;
    }

    if (params.category) {
      where.category = params.category;
    }

    if (params.assignedTo) {
      where.assignedToId = params.assignedTo;
    }

    const [items, total] = await Promise.all([
      ticketRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      ticketRepository.count(where),
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

  getTicketById: async (id: string) => {
    const ticket = await ticketRepository.findById(id);
    if (!ticket || ticket.deletedAt) {
      throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
    }
    return ticket;
  },

  createTicket: async (
    data: {
      subject: string;
      description?: string;
      status?: string;
      priority?: string;
      category?: string;
      customerId?: string;
      assignedToId?: string;
    },
    userId?: string
  ) => {
    return ticketRepository.create({
      ...data,
      createdBy: userId || null,
    });
  },

  updateTicket: async (
    id: string,
    data: Partial<{
      subject: string;
      description: string | null;
      status: string;
      priority: string;
      category: string;
      customerId: string;
      assignedToId: string;
    }>,
    userId?: string
  ) => {
    const existing = await ticketRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
    }
    return ticketRepository.update(id, { ...data, updatedBy: userId || null });
  },

  deleteTicket: async (id: string, userId?: string) => {
    const existing = await ticketRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
    }
    return ticketRepository.softDelete(id, userId);
  },

  updateTicketStatus: async (id: string, status: string, userId?: string) => {
    const existing = await ticketRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
    }
    return ticketRepository.update(id, { status, updatedBy: userId || null });
  },

  updateTicketPriority: async (id: string, priority: string, userId?: string) => {
    const existing = await ticketRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
    }
    return ticketRepository.update(id, { priority, updatedBy: userId || null });
  },

  assignTicket: async (id: string, assignedToId: string, userId?: string) => {
    const existing = await ticketRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
    }

    if (assignedToId) {
      const employee = await prisma.employee.findUnique({ where: { id: assignedToId } });
      if (!employee) {
        throw Object.assign(new Error('Employee not found'), { statusCode: 400 });
      }
    }

    return ticketRepository.update(id, { assignedToId: assignedToId || null, updatedBy: userId || null });
  },

  getTicketComments: async (id: string) => {
    const ticket = await ticketRepository.findById(id);
    if (!ticket || ticket.deletedAt) {
      throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
    }
    return prisma.ticketComment.findMany({
      where: { ticketId: id, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  },

  addTicketComment: async (
    id: string,
    data: { content: string },
    userId?: string
  ) => {
    const ticket = await ticketRepository.findById(id);
    if (!ticket || ticket.deletedAt) {
      throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
    }
    return prisma.ticketComment.create({
      data: {
        ticketId: id,
        content: data.content,
        createdBy: userId || null,
      },
    });
  },

  deleteTicketComment: async (ticketId: string, commentId: string, userId?: string) => {
    const comment = await prisma.ticketComment.findUnique({ where: { id: commentId } });
    if (!comment || comment.deletedAt || comment.ticketId !== ticketId) {
      throw Object.assign(new Error('Comment not found'), { statusCode: 404 });
    }
    return prisma.ticketComment.update({
      where: { id: commentId },
      data: { deletedAt: new Date(), deletedBy: userId || null },
    });
  },

  getTicketAttachments: async (id: string) => {
    const ticket = await ticketRepository.findById(id);
    if (!ticket || ticket.deletedAt) {
      throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
    }
    return prisma.ticketAttachment.findMany({
      where: { ticketId: id, deletedAt: null },
    });
  },

  uploadTicketAttachment: async (
    id: string,
    file: Express.Multer.File,
    userId?: string
  ) => {
    const ticket = await ticketRepository.findById(id);
    if (!ticket || ticket.deletedAt) {
      throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
    }
    if (!file) {
      throw Object.assign(new Error('No file provided'), { statusCode: 400 });
    }
    return prisma.ticketAttachment.create({
      data: {
        ticketId: id,
        name: file.originalname,
        path: file.path,
        mimeType: file.mimetype,
        size: file.size,
        createdBy: userId || null,
      },
    });
  },

  deleteTicketAttachment: async (ticketId: string, attachmentId: string, userId?: string) => {
    const attachment = await prisma.ticketAttachment.findUnique({ where: { id: attachmentId } });
    if (!attachment || attachment.deletedAt || attachment.ticketId !== ticketId) {
      throw Object.assign(new Error('Attachment not found'), { statusCode: 404 });
    }
    return prisma.ticketAttachment.update({
      where: { id: attachmentId },
      data: { deletedAt: new Date(), deletedBy: userId || null },
    });
  },

  getTicketTimeLogs: async (id: string) => {
    const ticket = await ticketRepository.findById(id);
    if (!ticket || ticket.deletedAt) {
      throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
    }
    return prisma.ticketTimeLog.findMany({
      where: { ticketId: id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  },

  logTicketTime: async (
    id: string,
    data: { hours: number; description?: string; loggedAt?: string },
    userId?: string
  ) => {
    const ticket = await ticketRepository.findById(id);
    if (!ticket || ticket.deletedAt) {
      throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
    }
    return prisma.ticketTimeLog.create({
      data: {
        ticketId: id,
        hours: data.hours,
        description: data.description,
        loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
        loggedById: userId || null,
        createdBy: userId || null,
      },
    });
  },

  getTicketStatistics: async () => {
    const [
      openCount,
      inProgressCount,
      resolvedCount,
      closedCount,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
    ] = await Promise.all([
      prisma.ticket.count({ where: { status: 'Open', deletedAt: null } }),
      prisma.ticket.count({ where: { status: 'In Progress', deletedAt: null } }),
      prisma.ticket.count({ where: { status: 'Resolved', deletedAt: null } }),
      prisma.ticket.count({ where: { status: 'Closed', deletedAt: null } }),
      prisma.ticket.count({ where: { priority: 'Critical', deletedAt: null } }),
      prisma.ticket.count({ where: { priority: 'High', deletedAt: null } }),
      prisma.ticket.count({ where: { priority: 'Medium', deletedAt: null } }),
      prisma.ticket.count({ where: { priority: 'Low', deletedAt: null } }),
    ]);

    return {
      byStatus: { open: openCount, inProgress: inProgressCount, resolved: resolvedCount, closed: closedCount },
      byPriority: { critical: criticalCount, high: highCount, medium: mediumCount, low: lowCount },
    };
  },
};

export default ticketService;
