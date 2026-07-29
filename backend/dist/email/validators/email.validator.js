"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailSchema = exports.updateAccountSchema = exports.createAccountSchema = void 0;
const zod_1 = require("zod");
exports.createAccountSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        displayName: zod_1.z.string().max(200).optional().nullable(),
        provider: zod_1.z.string().optional(),
        isDefault: zod_1.z.boolean().optional(),
    }),
});
exports.updateAccountSchema = zod_1.z.object({
    body: zod_1.z.object({
        displayName: zod_1.z.string().max(200).optional().nullable(),
        provider: zod_1.z.string().optional(),
        isDefault: zod_1.z.boolean().optional(),
    }),
});
exports.sendEmailSchema = zod_1.z.object({
    body: zod_1.z.object({
        accountId: zod_1.z.string().uuid('Invalid account ID'),
        to: zod_1.z.array(zod_1.z.string().email('Invalid recipient email')).min(1, 'At least one recipient is required'),
        cc: zod_1.z.array(zod_1.z.string().email('Invalid CC email')).optional(),
        bcc: zod_1.z.array(zod_1.z.string().email('Invalid BCC email')).optional(),
        subject: zod_1.z.string().min(1, 'Subject is required').max(500),
        body: zod_1.z.string().min(1, 'Body is required'),
    }),
});
