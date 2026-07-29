"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWebFormSchema = exports.createWebFormSchema = void 0;
const zod_1 = require("zod");
exports.createWebFormSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Form name is required').max(200),
        description: zod_1.z.string().max(5000).optional().nullable(),
        fields: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            type: zod_1.z.enum(['text', 'email', 'phone', 'number', 'select', 'checkbox', 'radio', 'textarea', 'date']),
            required: zod_1.z.boolean().optional().default(false),
            options: zod_1.z.array(zod_1.z.string()).optional(),
            label: zod_1.z.string().optional(),
            placeholder: zod_1.z.string().optional(),
        })).optional().default([]),
        submitLabel: zod_1.z.string().max(100).optional().default('Submit'),
        successMessage: zod_1.z.string().max(1000).optional().nullable(),
        redirectUrl: zod_1.z.string().url().optional().nullable(),
        notificationEmails: zod_1.z.array(zod_1.z.string().email()).optional().default([]),
        assignToId: zod_1.z.string().uuid('Invalid assignee ID').optional().nullable(),
        sourceId: zod_1.z.string().uuid('Invalid source ID').optional().nullable(),
        statusId: zod_1.z.string().uuid('Invalid status ID').optional().nullable(),
    }),
});
exports.updateWebFormSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Form name cannot be empty').max(200).optional(),
        description: zod_1.z.string().max(5000).optional().nullable(),
        fields: zod_1.z.array(zod_1.z.object({
            name: zod_1.z.string(),
            type: zod_1.z.enum(['text', 'email', 'phone', 'number', 'select', 'checkbox', 'radio', 'textarea', 'date']),
            required: zod_1.z.boolean().optional().default(false),
            options: zod_1.z.array(zod_1.z.string()).optional(),
            label: zod_1.z.string().optional(),
            placeholder: zod_1.z.string().optional(),
        })).optional(),
        submitLabel: zod_1.z.string().max(100).optional(),
        successMessage: zod_1.z.string().max(1000).optional().nullable(),
        redirectUrl: zod_1.z.string().url().optional().nullable(),
        notificationEmails: zod_1.z.array(zod_1.z.string().email()).optional(),
        assignToId: zod_1.z.string().uuid('Invalid assignee ID').optional().nullable(),
        sourceId: zod_1.z.string().uuid('Invalid source ID').optional().nullable(),
        statusId: zod_1.z.string().uuid('Invalid status ID').optional().nullable(),
    }),
});
