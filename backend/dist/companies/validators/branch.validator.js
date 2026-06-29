"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBranchSchema = exports.createBranchSchema = void 0;
const zod_1 = require("zod");
exports.createBranchSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Branch name is required').max(200),
        branchCode: zod_1.z.string().max(50).optional().or(zod_1.z.literal('')),
        branchType: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        managerId: zod_1.z.string().uuid('Invalid manager ID').optional().or(zod_1.z.literal('')),
        phone: zod_1.z.string().max(50).optional().or(zod_1.z.literal('')),
        email: zod_1.z.string().email('Invalid email').optional().or(zod_1.z.literal('')),
        address: zod_1.z.string().max(500).optional().or(zod_1.z.literal('')),
        gst: zod_1.z.string().max(50).optional().or(zod_1.z.literal('')),
        country: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        state: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        city: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        employeeCount: zod_1.z.number().int().min(0).optional(),
        revenue: zod_1.z.number().min(0).optional(),
        status: zod_1.z.string().max(50).optional(),
        openingDate: zod_1.z.string().optional().or(zod_1.z.literal('')),
        timezone: zod_1.z.string().max(50).optional().or(zod_1.z.literal('')),
    }),
    params: zod_1.z.object({ id: zod_1.z.string().uuid('Invalid company ID') }),
    query: zod_1.z.object({}).optional(),
});
exports.updateBranchSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Branch name is required').max(200).optional(),
        branchCode: zod_1.z.string().max(50).optional().or(zod_1.z.literal('')),
        branchType: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        managerId: zod_1.z.string().uuid('Invalid manager ID').optional().nullable(),
        phone: zod_1.z.string().max(50).optional().or(zod_1.z.literal('')),
        email: zod_1.z.string().email('Invalid email').optional().or(zod_1.z.literal('')),
        address: zod_1.z.string().max(500).optional().or(zod_1.z.literal('')),
        gst: zod_1.z.string().max(50).optional().or(zod_1.z.literal('')),
        country: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        state: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        city: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        employeeCount: zod_1.z.number().int().min(0).optional(),
        revenue: zod_1.z.number().min(0).optional(),
        status: zod_1.z.string().max(50).optional(),
        openingDate: zod_1.z.string().optional().nullable(),
        timezone: zod_1.z.string().max(50).optional().or(zod_1.z.literal('')),
    }),
    params: zod_1.z.object({ id: zod_1.z.string().uuid('Invalid company ID'), branchId: zod_1.z.string().uuid('Invalid branch ID') }),
    query: zod_1.z.object({}).optional(),
});
