"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDataRequestSchema = exports.recordConsentSchema = void 0;
const zod_1 = require("zod");
exports.recordConsentSchema = zod_1.z.object({
    body: zod_1.z.object({
        contactId: zod_1.z.string().uuid('Invalid contact ID').optional().nullable(),
        companyId: zod_1.z.string().uuid('Invalid company ID').optional().nullable(),
        contactName: zod_1.z.string().optional().nullable(),
        contactEmail: zod_1.z.string().optional().nullable(),
        purpose: zod_1.z.string().optional().nullable(),
        type: zod_1.z.string().optional().default('Marketing'),
        granted: zod_1.z.boolean().optional().default(true),
        source: zod_1.z.string().optional().default('Manual'),
        ipAddress: zod_1.z.string().optional().nullable(),
        expiresAt: zod_1.z.string().optional().nullable(),
        details: zod_1.z.any().optional().nullable(),
    }),
});
exports.createDataRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        contactId: zod_1.z.string().uuid('Invalid contact ID').optional().nullable(),
        companyId: zod_1.z.string().uuid('Invalid company ID').optional().nullable(),
        requestorName: zod_1.z.string().optional().nullable(),
        requestorEmail: zod_1.z.string().optional().nullable(),
        type: zod_1.z.string().optional().default('Access'),
        description: zod_1.z.string().max(5000).optional().nullable(),
    }),
});
