"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCalendarByIdSchema = exports.updateCalendarSchema = exports.createCalendarSchema = void 0;
const zod_1 = require("zod");
exports.createCalendarSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required'),
        description: zod_1.z.string().optional().nullable(),
        startTime: zod_1.z.any().optional().nullable(),
        endTime: zod_1.z.any().optional().nullable(),
        location: zod_1.z.string().optional().nullable(),
        organizerId: zod_1.z.string().optional().nullable().or(zod_1.z.literal('')),
        customerId: zod_1.z.string().optional().nullable().or(zod_1.z.literal('')),
        dealId: zod_1.z.string().optional().nullable().or(zod_1.z.literal('')),
    }),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object({}).optional(),
});
exports.updateCalendarSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().optional().nullable(),
        description: zod_1.z.string().optional().nullable(),
        startTime: zod_1.z.any().optional().nullable(),
        endTime: zod_1.z.any().optional().nullable(),
        location: zod_1.z.string().optional().nullable(),
        organizerId: zod_1.z.string().optional().nullable(),
        customerId: zod_1.z.string().optional().nullable(),
        dealId: zod_1.z.string().optional().nullable(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().optional(),
    }),
    query: zod_1.z.object({}).optional(),
});
exports.getCalendarByIdSchema = zod_1.z.object({
    body: zod_1.z.any().optional(),
    params: zod_1.z.object({
        id: zod_1.z.string().optional(),
    }),
    query: zod_1.z.any().optional(),
});
