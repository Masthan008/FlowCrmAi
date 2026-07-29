"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMilestoneSchema = exports.createMilestoneSchema = exports.updateProjectSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
exports.createProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Project name is required').max(300),
        description: zod_1.z.string().max(5000).optional().nullable(),
        status: zod_1.z.string().optional(),
        priority: zod_1.z.string().optional(),
        ownerId: zod_1.z.string().uuid('Invalid owner ID').optional().nullable(),
        startDate: zod_1.z.string().datetime('Invalid start date format').optional().nullable(),
        endDate: zod_1.z.string().datetime('Invalid end date format').optional().nullable(),
        budget: zod_1.z.number().nonnegative('Budget must be non-negative').optional(),
    }),
});
exports.updateProjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Project name cannot be empty').max(300).optional(),
        description: zod_1.z.string().max(5000).optional().nullable(),
        status: zod_1.z.string().optional(),
        priority: zod_1.z.string().optional(),
        ownerId: zod_1.z.string().uuid('Invalid owner ID').optional().nullable(),
        startDate: zod_1.z.string().datetime('Invalid start date format').optional().nullable(),
        endDate: zod_1.z.string().datetime('Invalid end date format').optional().nullable(),
        budget: zod_1.z.number().nonnegative('Budget must be non-negative').optional(),
    }),
});
exports.createMilestoneSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Milestone name is required').max(300),
        description: zod_1.z.string().max(5000).optional().nullable(),
        dueDate: zod_1.z.string().datetime('Invalid due date format').optional().nullable(),
        status: zod_1.z.string().optional(),
    }),
});
exports.updateMilestoneSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Milestone name cannot be empty').max(300).optional(),
        description: zod_1.z.string().max(5000).optional().nullable(),
        dueDate: zod_1.z.string().datetime('Invalid due date format').optional().nullable(),
        status: zod_1.z.string().optional(),
    }),
});
