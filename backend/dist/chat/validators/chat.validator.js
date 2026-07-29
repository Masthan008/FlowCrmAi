"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateConversationSchema = exports.assignConversationSchema = exports.sendMessageSchema = exports.createChatConversationSchema = void 0;
const zod_1 = require("zod");
exports.createChatConversationSchema = zod_1.z.object({
    body: zod_1.z.object({
        sessionId: zod_1.z.string().min(1, 'Session ID is required'),
        visitorName: zod_1.z.string().max(200).optional().nullable(),
        visitorEmail: zod_1.z.string().email('Invalid email').optional().nullable(),
        visitorPhone: zod_1.z.string().max(50).optional().nullable(),
        pageUrl: zod_1.z.string().max(2000).optional().nullable(),
        customerId: zod_1.z.string().uuid('Invalid customer ID').optional().nullable(),
        companyId: zod_1.z.string().uuid('Invalid company ID').optional().nullable(),
    }),
});
exports.sendMessageSchema = zod_1.z.object({
    body: zod_1.z.object({
        content: zod_1.z.string().min(1, 'Message content is required'),
        senderType: zod_1.z.enum(['Visitor', 'Agent', 'System']).optional().default('Visitor'),
        senderId: zod_1.z.string().uuid('Invalid sender ID').optional().nullable(),
        contentType: zod_1.z.enum(['Text', 'Image', 'File', 'System']).optional().default('Text'),
        fileUrl: zod_1.z.string().url().optional().nullable(),
    }),
});
exports.assignConversationSchema = zod_1.z.object({
    body: zod_1.z.object({
        assignedToId: zod_1.z.string().uuid('Invalid agent ID'),
    }),
});
exports.rateConversationSchema = zod_1.z.object({
    body: zod_1.z.object({
        rating: zod_1.z.number().int().min(1).max(5),
        ratingComment: zod_1.z.string().max(1000).optional().nullable(),
    }),
});
