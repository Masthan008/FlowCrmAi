"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContractSchema = exports.createContractSchema = void 0;
const zod_1 = require("zod");
exports.createContractSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional().nullable(),
        name: zod_1.z.string().optional().nullable(),
        description: zod_1.z.string().max(5000).optional().nullable(),
        type: zod_1.z.string().optional().nullable(),
        status: zod_1.z.string().optional(),
        customerId: zod_1.z.string().uuid('Invalid customer ID').optional().nullable(),
        startDate: zod_1.z.string().optional().nullable(),
        endDate: zod_1.z.string().optional().nullable(),
        value: zod_1.z.number().nonnegative('Value must be non-negative').optional(),
    }),
});
exports.updateContractSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Contract name cannot be empty').max(300).optional(),
        description: zod_1.z.string().max(5000).optional().nullable(),
        type: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        customerId: zod_1.z.string().uuid('Invalid customer ID').optional(),
        startDate: zod_1.z.string().datetime('Invalid start date format').optional(),
        endDate: zod_1.z.string().datetime('Invalid end date format').optional().nullable(),
        value: zod_1.z.number().nonnegative('Value must be non-negative').optional(),
    }),
});
