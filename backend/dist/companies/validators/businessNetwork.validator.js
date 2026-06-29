"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBusinessNetworkSchema = exports.createBusinessNetworkSchema = void 0;
const zod_1 = require("zod");
exports.createBusinessNetworkSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name is required').max(200),
        relatedCompanyId: zod_1.z.string().uuid('Invalid company ID').optional().nullable(),
        relationshipType: zod_1.z.string().max(100).optional(),
        description: zod_1.z.string().max(1000).optional().or(zod_1.z.literal('')),
        status: zod_1.z.string().max(50).optional(),
        website: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
    }),
    params: zod_1.z.object({ id: zod_1.z.string().uuid('Invalid company ID') }),
    query: zod_1.z.object({}).optional(),
});
exports.updateBusinessNetworkSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name is required').max(200).optional(),
        relatedCompanyId: zod_1.z.string().uuid('Invalid company ID').optional().nullable(),
        relationshipType: zod_1.z.string().max(100).optional(),
        description: zod_1.z.string().max(1000).optional().nullable(),
        status: zod_1.z.string().max(50).optional(),
        website: zod_1.z.string().max(200).optional().nullable(),
    }),
    params: zod_1.z.object({ id: zod_1.z.string().uuid('Invalid company ID'), entryId: zod_1.z.string().uuid('Invalid entry ID') }),
    query: zod_1.z.object({}).optional(),
});
