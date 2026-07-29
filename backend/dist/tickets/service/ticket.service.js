"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketService = void 0;
const ticket_repository_1 = require("../repository/ticket.repository");
const db_1 = require("../../database/db");
exports.ticketService = {
    getTickets: async (params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
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
            ticket_repository_1.ticketRepository.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
            }),
            ticket_repository_1.ticketRepository.count(where),
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
    getTicketById: async (id) => {
        const ticket = await ticket_repository_1.ticketRepository.findById(id);
        if (!ticket || ticket.deletedAt) {
            throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
        }
        return ticket;
    },
    createTicket: async (data, userId) => {
        return ticket_repository_1.ticketRepository.create({
            ...data,
            ticketNumber: data.ticketNumber || `TCK-${Date.now()}`,
            createdBy: userId || null,
        });
    },
    updateTicket: async (id, data, userId) => {
        const existing = await ticket_repository_1.ticketRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
        }
        return ticket_repository_1.ticketRepository.update(id, { ...data, updatedBy: userId || null });
    },
    deleteTicket: async (id, userId) => {
        const existing = await ticket_repository_1.ticketRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
        }
        return ticket_repository_1.ticketRepository.softDelete(id, userId);
    },
    updateTicketStatus: async (id, status, userId) => {
        const existing = await ticket_repository_1.ticketRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
        }
        return ticket_repository_1.ticketRepository.update(id, { status, updatedBy: userId || null });
    },
    updateTicketPriority: async (id, priority, userId) => {
        const existing = await ticket_repository_1.ticketRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
        }
        return ticket_repository_1.ticketRepository.update(id, { priority, updatedBy: userId || null });
    },
    assignTicket: async (id, assignedToId, userId) => {
        const existing = await ticket_repository_1.ticketRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
        }
        if (assignedToId) {
            const employee = await db_1.prisma.employee.findUnique({ where: { id: assignedToId } });
            if (!employee) {
                throw Object.assign(new Error('Employee not found'), { statusCode: 400 });
            }
        }
        return ticket_repository_1.ticketRepository.update(id, { assignedToId: assignedToId || null, updatedBy: userId || null });
    },
    getTicketComments: async (id) => {
        const ticket = await ticket_repository_1.ticketRepository.findById(id);
        if (!ticket || ticket.deletedAt) {
            throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
        }
        return db_1.prisma.ticketComment.findMany({
            where: { ticketId: id, deletedAt: null },
            orderBy: { createdAt: 'asc' },
        });
    },
    addTicketComment: async (id, data, userId) => {
        const ticket = await ticket_repository_1.ticketRepository.findById(id);
        if (!ticket || ticket.deletedAt) {
            throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
        }
        return db_1.prisma.ticketComment.create({
            data: {
                ticketId: id,
                content: data.content,
                createdBy: userId || null,
            },
        });
    },
    deleteTicketComment: async (ticketId, commentId, userId) => {
        const comment = await db_1.prisma.ticketComment.findUnique({ where: { id: commentId } });
        if (!comment || comment.deletedAt || comment.ticketId !== ticketId) {
            throw Object.assign(new Error('Comment not found'), { statusCode: 404 });
        }
        return db_1.prisma.ticketComment.update({
            where: { id: commentId },
            data: { deletedAt: new Date(), deletedBy: userId || null },
        });
    },
    getTicketAttachments: async (id) => {
        const ticket = await ticket_repository_1.ticketRepository.findById(id);
        if (!ticket || ticket.deletedAt) {
            throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
        }
        return db_1.prisma.ticketAttachment.findMany({
            where: { ticketId: id, deletedAt: null },
        });
    },
    uploadTicketAttachment: async (id, file, userId) => {
        const ticket = await ticket_repository_1.ticketRepository.findById(id);
        if (!ticket || ticket.deletedAt) {
            throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
        }
        if (!file) {
            throw Object.assign(new Error('No file provided'), { statusCode: 400 });
        }
        return db_1.prisma.ticketAttachment.create({
            data: {
                ticketId: id,
                fileName: file.originalname,
                filePath: file.path,
                mimeType: file.mimetype,
                size: file.size,
                uploadedById: userId || null,
                createdBy: userId || null,
            },
        });
    },
    deleteTicketAttachment: async (ticketId, attachmentId, userId) => {
        const attachment = await db_1.prisma.ticketAttachment.findUnique({ where: { id: attachmentId } });
        if (!attachment || attachment.deletedAt || attachment.ticketId !== ticketId) {
            throw Object.assign(new Error('Attachment not found'), { statusCode: 404 });
        }
        return db_1.prisma.ticketAttachment.update({
            where: { id: attachmentId },
            data: { deletedAt: new Date() },
        });
    },
    getTicketTimeLogs: async (id) => {
        const ticket = await ticket_repository_1.ticketRepository.findById(id);
        if (!ticket || ticket.deletedAt) {
            throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
        }
        return db_1.prisma.ticketTimeLog.findMany({
            where: { ticketId: id, deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
    },
    logTicketTime: async (id, data, userId) => {
        const ticket = await ticket_repository_1.ticketRepository.findById(id);
        if (!ticket || ticket.deletedAt) {
            throw Object.assign(new Error('Ticket not found'), { statusCode: 404 });
        }
        let employeeId = userId;
        if (!employeeId) {
            const emp = await db_1.prisma.employee.findFirst();
            employeeId = emp?.id || '00000000-0000-0000-0000-000000000000';
        }
        return db_1.prisma.ticketTimeLog.create({
            data: {
                ticketId: id,
                employeeId: employeeId,
                minutes: data.hours ? Math.round(data.hours * 60) : 60,
                description: data.description,
                loggedAt: data.loggedAt ? new Date(data.loggedAt) : new Date(),
                createdBy: userId || null,
            },
        });
    },
    getTicketStatistics: async () => {
        const [openCount, inProgressCount, resolvedCount, closedCount, criticalCount, highCount, mediumCount, lowCount,] = await Promise.all([
            db_1.prisma.ticket.count({ where: { status: 'Open', deletedAt: null } }),
            db_1.prisma.ticket.count({ where: { status: 'In Progress', deletedAt: null } }),
            db_1.prisma.ticket.count({ where: { status: 'Resolved', deletedAt: null } }),
            db_1.prisma.ticket.count({ where: { status: 'Closed', deletedAt: null } }),
            db_1.prisma.ticket.count({ where: { priority: 'Critical', deletedAt: null } }),
            db_1.prisma.ticket.count({ where: { priority: 'High', deletedAt: null } }),
            db_1.prisma.ticket.count({ where: { priority: 'Medium', deletedAt: null } }),
            db_1.prisma.ticket.count({ where: { priority: 'Low', deletedAt: null } }),
        ]);
        return {
            byStatus: { open: openCount, inProgress: inProgressCount, resolved: resolvedCount, closed: closedCount },
            byPriority: { critical: criticalCount, high: highCount, medium: mediumCount, low: lowCount },
        };
    },
};
exports.default = exports.ticketService;
