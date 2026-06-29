"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompanyActivitySchema = exports.createCompanyActivitySchema = void 0;
const zod_1 = require("zod");
exports.createCompanyActivitySchema = zod_1.z.object({
    body: zod_1.z.object({
        type: zod_1.z.enum(['Call', 'Meeting', 'Email', 'Visit', 'Demo', 'Presentation', 'Negotiation', 'Follow-up', 'Support', 'Custom']),
        title: zod_1.z.string().min(1, 'Activity title is required').max(200),
        description: zod_1.z.string().max(2000).optional().or(zod_1.z.literal('')),
        activityDate: zod_1.z.string().datetime({ message: 'Invalid activity date format' }),
        status: zod_1.z.enum(['Planned', 'Completed', 'Cancelled']).optional(),
        priority: zod_1.z.enum(['Low', 'Medium', 'High']).optional(),
        isCompleted: zod_1.z.boolean().optional(),
        assignedToId: zod_1.z.string().uuid('Invalid owner ID').optional().or(zod_1.z.literal('')),
    }),
    params: zod_1.z.object({ id: zod_1.z.string().uuid('Invalid company ID') }),
    query: zod_1.z.object({}).optional(),
});
exports.updateCompanyActivitySchema = zod_1.z.object({
    body: zod_1.z.object({
        type: zod_1.z.enum(['Call', 'Meeting', 'Email', 'Visit', 'Demo', 'Presentation', 'Negotiation', 'Follow-up', 'Support', 'Custom']).optional(),
        title: zod_1.z.string().min(1).max(200).optional(),
        description: zod_1.z.string().max(2000).optional().or(zod_1.z.literal('')),
        activityDate: zod_1.z.string().datetime().optional(),
        status: zod_1.z.enum(['Planned', 'Completed', 'Cancelled']).optional(),
        priority: zod_1.z.enum(['Low', 'Medium', 'High']).optional(),
        isCompleted: zod_1.z.boolean().optional(),
        assignedToId: zod_1.z.string().uuid('Invalid owner ID').optional().or(zod_1.z.literal('')),
    }),
    params: zod_1.z.object({ id: zod_1.z.string().uuid('Invalid company ID'), activityId: zod_1.z.string().uuid('Invalid activity ID') }),
    query: zod_1.z.object({}).optional(),
});
