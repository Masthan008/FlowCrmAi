"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommentSchema = exports.patchAssignSchema = exports.patchProgressSchema = exports.patchStatusSchema = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
const priorityEnum = zod_1.z.enum(['Critical', 'High', 'Medium', 'Low']);
const statusEnum = zod_1.z.enum(['Pending', 'In Progress', 'Waiting', 'Completed', 'Cancelled', 'Overdue']);
const taskTypeEnum = zod_1.z.enum([
    'Call',
    'Meeting',
    'Email',
    'Follow-up',
    'Documentation',
    'Sales',
    'Support',
    'General',
    'Custom',
]);
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Task title is required'),
    description: zod_1.z.string().optional().nullable(),
    priority: priorityEnum.default('Medium'),
    status: statusEnum.default('Pending'),
    taskType: taskTypeEnum.default('General'),
    relatedModule: zod_1.z.string().optional().nullable(),
    relatedRecordId: zod_1.z.string().uuid().optional().nullable(),
    assignedToId: zod_1.z.string().uuid('Invalid assignedToId format'),
    assignedById: zod_1.z.string().uuid().optional().nullable(),
    department: zod_1.z.string().optional().nullable(),
    startDate: zod_1.z.string().optional().nullable(),
    dueDate: zod_1.z.string().optional().nullable(),
    completedDate: zod_1.z.string().optional().nullable(),
    estimatedHours: zod_1.z.number().nonnegative().optional().nullable(),
    actualHours: zod_1.z.number().nonnegative().optional().nullable(),
    reminderDate: zod_1.z.string().optional().nullable(),
    reminderTime: zod_1.z.string().optional().nullable(),
    progressPercentage: zod_1.z.number().int().min(0).max(100).default(0),
    tags: zod_1.z.array(zod_1.z.string()).optional().default([]),
});
exports.updateTaskSchema = exports.createTaskSchema.partial().extend({
    title: zod_1.z.string().min(1).optional(),
});
exports.patchStatusSchema = zod_1.z.object({
    taskId: zod_1.z.string().uuid().optional(),
    status: statusEnum,
    completedDate: zod_1.z.string().optional().nullable(),
});
exports.patchProgressSchema = zod_1.z.object({
    taskId: zod_1.z.string().uuid().optional(),
    progressPercentage: zod_1.z.number().int().min(0).max(100),
});
exports.patchAssignSchema = zod_1.z.object({
    taskId: zod_1.z.string().uuid().optional(),
    assignedToId: zod_1.z.string().uuid('Invalid assignedToId format'),
    department: zod_1.z.string().optional().nullable(),
});
exports.createCommentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1, 'Comment content cannot be empty'),
});
