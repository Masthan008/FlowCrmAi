"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSubscriptionSchema = exports.createSubscriptionSchema = exports.updatePlanSchema = exports.createPlanSchema = void 0;
const zod_1 = require("zod");
exports.createPlanSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Plan name is required').max(200),
        description: zod_1.z.string().max(2000).optional().nullable(),
        price: zod_1.z.number().nonnegative('Price must be non-negative'),
        interval: zod_1.z.string().min(1, 'Billing interval is required'),
        features: zod_1.z.any().optional(),
    }),
});
exports.updatePlanSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Plan name cannot be empty').max(200).optional(),
        description: zod_1.z.string().max(2000).optional().nullable(),
        price: zod_1.z.number().nonnegative('Price must be non-negative').optional(),
        interval: zod_1.z.string().optional(),
        features: zod_1.z.any().optional(),
    }),
});
exports.createSubscriptionSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerId: zod_1.z.string().uuid('Invalid customer ID'),
        planId: zod_1.z.string().uuid('Invalid plan ID'),
        status: zod_1.z.string().optional(),
        startDate: zod_1.z.string().datetime('Invalid start date format'),
        endDate: zod_1.z.string().datetime('Invalid end date format').optional().nullable(),
    }),
});
exports.updateSubscriptionSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.string().optional(),
        planId: zod_1.z.string().uuid('Invalid plan ID').optional(),
        endDate: zod_1.z.string().datetime('Invalid end date format').optional().nullable(),
    }),
});
