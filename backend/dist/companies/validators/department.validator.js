"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDepartmentSchema = exports.createDepartmentSchema = void 0;
const zod_1 = require("zod");
exports.createDepartmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Department name is required').max(200),
        type: zod_1.z.string().max(100).optional(),
        managerId: zod_1.z.string().uuid('Invalid manager ID').optional().or(zod_1.z.literal('')),
        description: zod_1.z.string().max(1000).optional().or(zod_1.z.literal('')),
        revenue: zod_1.z.number().min(0).optional(),
        status: zod_1.z.string().max(50).optional(),
        employeeCount: zod_1.z.number().int().min(0).optional(),
    }),
    params: zod_1.z.object({ id: zod_1.z.string().uuid('Invalid company ID') }),
    query: zod_1.z.object({}).optional(),
});
exports.updateDepartmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Department name is required').max(200).optional(),
        type: zod_1.z.string().max(100).optional(),
        managerId: zod_1.z.string().uuid('Invalid manager ID').optional().nullable(),
        description: zod_1.z.string().max(1000).optional().nullable(),
        revenue: zod_1.z.number().min(0).optional(),
        status: zod_1.z.string().max(50).optional(),
        employeeCount: zod_1.z.number().int().min(0).optional(),
    }),
    params: zod_1.z.object({ id: zod_1.z.string().uuid('Invalid company ID'), deptId: zod_1.z.string().uuid('Invalid department ID') }),
    query: zod_1.z.object({}).optional(),
});
