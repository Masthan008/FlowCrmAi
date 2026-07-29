"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketController = void 0;
const ticket_service_1 = require("../service/ticket.service");
const response_1 = require("../../helpers/response");
exports.ticketController = {
    list: async (req, res, next) => {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : undefined;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : undefined;
            const search = req.query.search;
            const status = req.query.status;
            const priority = req.query.priority;
            const category = req.query.category;
            const assignedTo = req.query.assignedTo;
            const result = await ticket_service_1.ticketService.getTickets({ page, limit, search, status, priority, category, assignedTo });
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Tickets retrieved successfully.', result);
        }
        catch (error) {
            next(error);
        }
    },
    getById: async (req, res, next) => {
        try {
            const ticket = await ticket_service_1.ticketService.getTicketById(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Ticket details retrieved successfully.', ticket);
        }
        catch (error) {
            next(error);
        }
    },
    create: async (req, res, next) => {
        try {
            const ticket = await ticket_service_1.ticketService.createTicket(req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Ticket created successfully.', ticket);
        }
        catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const ticket = await ticket_service_1.ticketService.updateTicket(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Ticket updated successfully.', ticket);
        }
        catch (error) {
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            await ticket_service_1.ticketService.deleteTicket(req.params.id, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Ticket deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    updateStatus: async (req, res, next) => {
        try {
            const ticket = await ticket_service_1.ticketService.updateTicketStatus(req.params.id, req.body.status, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Ticket status updated successfully.', ticket);
        }
        catch (error) {
            next(error);
        }
    },
    updatePriority: async (req, res, next) => {
        try {
            const ticket = await ticket_service_1.ticketService.updateTicketPriority(req.params.id, req.body.priority, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Ticket priority updated successfully.', ticket);
        }
        catch (error) {
            next(error);
        }
    },
    assign: async (req, res, next) => {
        try {
            const ticket = await ticket_service_1.ticketService.assignTicket(req.params.id, req.body.assignedToId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Ticket assigned successfully.', ticket);
        }
        catch (error) {
            next(error);
        }
    },
    getComments: async (req, res, next) => {
        try {
            const comments = await ticket_service_1.ticketService.getTicketComments(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Comments retrieved successfully.', comments);
        }
        catch (error) {
            next(error);
        }
    },
    addComment: async (req, res, next) => {
        try {
            const comment = await ticket_service_1.ticketService.addTicketComment(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Comment added successfully.', comment);
        }
        catch (error) {
            next(error);
        }
    },
    deleteComment: async (req, res, next) => {
        try {
            await ticket_service_1.ticketService.deleteTicketComment(req.params.id, req.params.commentId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Comment deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    getAttachments: async (req, res, next) => {
        try {
            const attachments = await ticket_service_1.ticketService.getTicketAttachments(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Attachments retrieved successfully.', attachments);
        }
        catch (error) {
            next(error);
        }
    },
    uploadAttachment: async (req, res, next) => {
        try {
            const attachment = await ticket_service_1.ticketService.uploadTicketAttachment(req.params.id, req.file, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Attachment uploaded successfully.', attachment);
        }
        catch (error) {
            next(error);
        }
    },
    deleteAttachment: async (req, res, next) => {
        try {
            await ticket_service_1.ticketService.deleteTicketAttachment(req.params.id, req.params.attachmentId, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Attachment deleted successfully.');
        }
        catch (error) {
            next(error);
        }
    },
    getTimeLogs: async (req, res, next) => {
        try {
            const timeLogs = await ticket_service_1.ticketService.getTicketTimeLogs(req.params.id);
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Time logs retrieved successfully.', timeLogs);
        }
        catch (error) {
            next(error);
        }
    },
    logTime: async (req, res, next) => {
        try {
            const timeLog = await ticket_service_1.ticketService.logTicketTime(req.params.id, req.body, req.user?.id);
            response_1.ResponseHelper.sendSuccess(req, res, 201, 'Time logged successfully.', timeLog);
        }
        catch (error) {
            next(error);
        }
    },
    getStatistics: async (req, res, next) => {
        try {
            const statistics = await ticket_service_1.ticketService.getTicketStatistics();
            response_1.ResponseHelper.sendSuccess(req, res, 200, 'Ticket statistics retrieved successfully.', statistics);
        }
        catch (error) {
            next(error);
        }
    },
};
exports.default = exports.ticketController;
