"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExpenseCategorySchema = exports.createExpenseCategorySchema = exports.updateExpenseSchema = exports.createExpenseSchema = void 0;
const zod_1 = require("zod");
exports.createExpenseSchema = zod_1.z.object({
    body: zod_1.z.object({
        employeeId: zod_1.z.string().uuid('Invalid employee ID'),
        categoryId: zod_1.z.string().uuid('Invalid category ID').optional().nullable(),
        amount: zod_1.z.number().positive('Amount must be positive'),
        currency: zod_1.z.string().max(3).optional().default('USD'),
        description: zod_1.z.string().max(5000).optional().nullable(),
        date: zod_1.z.string().datetime('Invalid date format'),
        receiptUrl: zod_1.z.string().url().optional().nullable(),
        dealId: zod_1.z.string().uuid('Invalid deal ID').optional().nullable(),
        projectId: zod_1.z.string().uuid('Invalid project ID').optional().nullable(),
        billable: zod_1.z.boolean().optional().default(false),
        taxRelevant: zod_1.z.boolean().optional().default(false),
        tags: zod_1.z.array(zod_1.z.string()).optional().default([]),
    }),
});
exports.updateExpenseSchema = zod_1.z.object({
    body: zod_1.z.object({
        employeeId: zod_1.z.string().uuid('Invalid employee ID').optional(),
        categoryId: zod_1.z.string().uuid('Invalid category ID').optional().nullable(),
        amount: zod_1.z.number().positive('Amount must be positive').optional(),
        currency: zod_1.z.string().max(3).optional(),
        description: zod_1.z.string().max(5000).optional().nullable(),
        date: zod_1.z.string().datetime('Invalid date format').optional(),
        receiptUrl: zod_1.z.string().url().optional().nullable(),
        dealId: zod_1.z.string().uuid('Invalid deal ID').optional().nullable(),
        projectId: zod_1.z.string().uuid('Invalid project ID').optional().nullable(),
        billable: zod_1.z.boolean().optional(),
        taxRelevant: zod_1.z.boolean().optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.createExpenseCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Category name is required').max(200),
        description: zod_1.z.string().max(2000).optional().nullable(),
        icon: zod_1.z.string().max(100).optional().nullable(),
    }),
});
exports.updateExpenseCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Category name cannot be empty').max(200).optional(),
        description: zod_1.z.string().max(2000).optional().nullable(),
        icon: zod_1.z.string().max(100).optional().nullable(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
