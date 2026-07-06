"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMeetingSchema = exports.createMeetingSchema = void 0;
const zod_1 = require("zod");
exports.createMeetingSchema = zod_1.z.object({
    body: zod_1.z.object({
        organizerId: zod_1.z.string().uuid('Invalid organizer ID'),
        customerId: zod_1.z.string().uuid('Invalid customer ID').optional().nullable(),
        dealId: zod_1.z.string().uuid('Invalid deal ID').optional().nullable(),
        title: zod_1.z.string().min(1, 'Meeting title is required').max(200),
        description: zod_1.z.string().max(2000).optional().nullable(),
        startTime: zod_1.z.string().datetime('Invalid start time format'),
        endTime: zod_1.z.string().datetime('Invalid end time format'),
        location: zod_1.z.string().max(300).optional().nullable(),
    }),
});
exports.updateMeetingSchema = zod_1.z.object({
    body: zod_1.z.object({
        organizerId: zod_1.z.string().uuid('Invalid organizer ID').optional(),
        customerId: zod_1.z.string().uuid('Invalid customer ID').optional().nullable(),
        dealId: zod_1.z.string().uuid('Invalid deal ID').optional().nullable(),
        title: zod_1.z.string().min(1, 'Meeting title cannot be empty').max(200).optional(),
        description: zod_1.z.string().max(2000).optional().nullable(),
        startTime: zod_1.z.string().datetime('Invalid start time format').optional(),
        endTime: zod_1.z.string().datetime('Invalid end time format').optional(),
        location: zod_1.z.string().max(300).optional().nullable(),
    }),
});
