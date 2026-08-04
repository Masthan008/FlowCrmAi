"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.portalRegisterSchema = exports.portalLoginSchema = exports.updatePortalUserSchema = exports.createPortalUserSchema = void 0;
const zod_1 = require("zod");
exports.createPortalUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerId: zod_1.z.string().uuid('Invalid customer ID').optional().nullable(),
        email: zod_1.z.string().email('Invalid email'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters').optional().nullable(),
        name: zod_1.z.string().optional().nullable(),
        company: zod_1.z.string().optional().nullable(),
        firstName: zod_1.z.string().optional().nullable(),
        lastName: zod_1.z.string().optional().nullable(),
        permissions: zod_1.z.array(zod_1.z.string()).optional().default([]),
    }),
});
exports.updatePortalUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email').optional(),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters').optional().nullable(),
        name: zod_1.z.string().optional().nullable(),
        company: zod_1.z.string().optional().nullable(),
        firstName: zod_1.z.string().optional().nullable(),
        lastName: zod_1.z.string().optional().nullable(),
        isActive: zod_1.z.boolean().optional(),
        permissions: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.portalLoginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
exports.portalRegisterSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerId: zod_1.z.string().uuid('Invalid customer ID'),
        email: zod_1.z.string().email('Invalid email'),
        password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
        firstName: zod_1.z.string().min(1, 'First name is required').max(100),
        lastName: zod_1.z.string().min(1, 'Last name is required').max(100),
    }),
});
