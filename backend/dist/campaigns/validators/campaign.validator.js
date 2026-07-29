"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCampaignEmailSchema = exports.createCampaignEmailSchema = exports.createCampaignListSchema = exports.updateCampaignSchema = exports.createCampaignSchema = void 0;
const zod_1 = require("zod");
exports.createCampaignSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Campaign name is required').max(200),
        description: zod_1.z.string().max(2000).optional().nullable(),
        type: zod_1.z.string().min(1, 'Campaign type is required'),
        status: zod_1.z.string().optional(),
        scheduledAt: zod_1.z.string().datetime('Invalid scheduled time format').optional().nullable(),
    }),
});
exports.updateCampaignSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Campaign name cannot be empty').max(200).optional(),
        description: zod_1.z.string().max(2000).optional().nullable(),
        type: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        scheduledAt: zod_1.z.string().datetime('Invalid scheduled time format').optional().nullable(),
    }),
});
exports.createCampaignListSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'List name is required').max(200),
        description: zod_1.z.string().max(2000).optional().nullable(),
    }),
});
exports.createCampaignEmailSchema = zod_1.z.object({
    body: zod_1.z.object({
        subject: zod_1.z.string().min(1, 'Email subject is required').max(500),
        body: zod_1.z.string().min(1, 'Email body is required'),
        order: zod_1.z.number().int().optional(),
    }),
});
exports.updateCampaignEmailSchema = zod_1.z.object({
    body: zod_1.z.object({
        subject: zod_1.z.string().min(1, 'Email subject cannot be empty').max(500).optional(),
        body: zod_1.z.string().min(1, 'Email body cannot be empty').optional(),
        order: zod_1.z.number().int().optional(),
    }),
});
