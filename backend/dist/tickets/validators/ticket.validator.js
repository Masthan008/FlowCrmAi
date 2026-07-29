"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTicketTimeLogSchema = exports.createTicketCommentSchema = exports.updateTicketSchema = exports.createTicketSchema = void 0;
const zod_1 = require("zod");
exports.createTicketSchema = zod_1.z.object({
    body: zod_1.z.object({
        subject: zod_1.z.string().min(1, 'Subject is required').max(500),
        description: zod_1.z.string().max(5000).optional().nullable(),
        status: zod_1.z.string().optional(),
        priority: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
        customerId: zod_1.z.string().uuid('Invalid customer ID').optional().nullable(),
        assignedToId: zod_1.z.string().uuid('Invalid assignee ID').optional().nullable(),
    }),
});
exports.updateTicketSchema = zod_1.z.object({
    body: zod_1.z.object({
        subject: zod_1.z.string().min(1, 'Subject cannot be empty').max(500).optional(),
        description: zod_1.z.string().max(5000).optional().nullable(),
        status: zod_1.z.string().optional(),
        priority: zod_1.z.string().optional(),
        category: zod_1.z.string().optional(),
        customerId: zod_1.z.string().uuid('Invalid customer ID').optional().nullable(),
        assignedToId: zod_1.z.string().uuid('Invalid assignee ID').optional().nullable(),
    }),
});
exports.createTicketCommentSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, 'Comment content is required').max(5000),
    }),
});
exports.createTicketTimeLogSchema = zod_1.z.object({
    body: zod_1.z.object({
        hours: zod_1.z.number().positive('Hours must be positive'),
        description: zod_1.z.string().max(2000).optional().nullable(),
        loggedAt: zod_1.z.string().datetime('Invalid datetime format').optional().nullable(),
    }),
});
