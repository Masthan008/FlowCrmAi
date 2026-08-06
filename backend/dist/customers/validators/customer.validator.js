"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomerByIdSchema = exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
const zod_1 = require("zod");
exports.createCustomerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name is required'),
        email: zod_1.z.string().email('Invalid email address').optional().nullable().or(zod_1.z.literal('')),
        phone: zod_1.z.string().optional().nullable().or(zod_1.z.literal('')),
        type: zod_1.z.string().optional().nullable(),
        status: zod_1.z.string().optional().nullable(),
        companyId: zod_1.z.string().optional().nullable().or(zod_1.z.literal('')),
    }),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object({}).optional(),
});
exports.updateCustomerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional().nullable(),
        email: zod_1.z.string().optional().nullable(),
        phone: zod_1.z.string().optional().nullable(),
        type: zod_1.z.string().optional().nullable(),
        status: zod_1.z.string().optional().nullable(),
        companyId: zod_1.z.string().optional().nullable(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().optional(),
    }),
    query: zod_1.z.object({}).optional(),
});
exports.getCustomerByIdSchema = zod_1.z.object({
    body: zod_1.z.any().optional(),
    params: zod_1.z.object({
        id: zod_1.z.string().optional(),
    }),
    query: zod_1.z.any().optional(),
});
