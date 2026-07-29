"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDataRequestSchema = exports.recordConsentSchema = void 0;
const zod_1 = require("zod");
exports.recordConsentSchema = zod_1.z.object({
    body: zod_1.z.object({
        contactId: zod_1.z.string().uuid('Invalid contact ID').optional().nullable(),
        companyId: zod_1.z.string().uuid('Invalid company ID').optional().nullable(),
        type: zod_1.z.enum(['Marketing', 'Analytics', 'ThirdParty', 'Cookies', 'Communications']),
        granted: zod_1.z.boolean().optional().default(true),
        source: zod_1.z.enum(['Form', 'Portal', 'Email', 'Manual']),
        ipAddress: zod_1.z.string().optional().nullable(),
        expiresAt: zod_1.z.string().datetime('Invalid date format').optional().nullable(),
        details: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional().nullable(),
    }),
});
exports.createDataRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        contactId: zod_1.z.string().uuid('Invalid contact ID').optional().nullable(),
        companyId: zod_1.z.string().uuid('Invalid company ID').optional().nullable(),
        type: zod_1.z.enum(['Access', 'Rectification', 'Erasure', 'Portability', 'Restrict', 'Object']),
        description: zod_1.z.string().max(5000).optional().nullable(),
    }),
});
