"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateActivitySchema = exports.createActivitySchema = void 0;
const zod_1 = require("zod");
exports.createActivitySchema = zod_1.z.object({
    body: zod_1.z.object({
        type: zod_1.z.enum(['Call', 'Meeting', 'Email', 'SMS', 'Task', 'Follow-up', 'Demo', 'Visit', 'Custom']),
        title: zod_1.z.string().min(1, 'Activity title is required').max(200),
        description: zod_1.z.string().max(2000).optional().or(zod_1.z.literal('')),
        activityDate: zod_1.z.string().datetime({ message: 'Invalid activity date format' }),
        status: zod_1.z.enum(['Planned', 'Completed', 'Cancelled']).optional(),
        priority: zod_1.z.enum(['Low', 'Medium', 'High']).optional(),
        isCompleted: zod_1.z.boolean().optional(),
        assignedToId: zod_1.z.string().uuid('Invalid owner ID').optional().or(zod_1.z.literal('')),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid lead ID'),
    }),
    query: zod_1.z.object({}).optional(),
});
exports.updateActivitySchema = zod_1.z.object({
    body: zod_1.z.object({
        type: zod_1.z.enum(['Call', 'Meeting', 'Email', 'SMS', 'Task', 'Follow-up', 'Demo', 'Visit', 'Custom']).optional(),
        title: zod_1.z.string().min(1).max(200).optional(),
        description: zod_1.z.string().max(2000).optional().or(zod_1.z.literal('')),
        activityDate: zod_1.z.string().datetime().optional(),
        status: zod_1.z.enum(['Planned', 'Completed', 'Cancelled']).optional(),
        priority: zod_1.z.enum(['Low', 'Medium', 'High']).optional(),
        isCompleted: zod_1.z.boolean().optional(),
        assignedToId: zod_1.z.string().uuid('Invalid owner ID').optional().or(zod_1.z.literal('')),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid lead ID'),
        activityId: zod_1.z.string().uuid('Invalid activity ID'),
    }),
    query: zod_1.z.object({}).optional(),
});
