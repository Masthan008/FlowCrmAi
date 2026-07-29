"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approvePayoutSchema = exports.updateCommissionRuleSchema = exports.createCommissionRuleSchema = void 0;
const zod_1 = require("zod");
exports.createCommissionRuleSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Rule name is required').max(200),
        description: zod_1.z.string().max(5000).optional().nullable(),
        type: zod_1.z.enum(['Percentage', 'Fixed', 'Tiered', 'Formula']).optional().default('Percentage'),
        calculation: zod_1.z.string().max(5000).optional().nullable(),
        rate: zod_1.z.number().min(0).optional().default(0),
        tierConfig: zod_1.z.array(zod_1.z.object({
            minValue: zod_1.z.number(),
            maxValue: zod_1.z.number(),
            rate: zod_1.z.number(),
        })).optional().default([]),
        conditions: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional().nullable(),
        productIds: zod_1.z.array(zod_1.z.string()).optional().default([]),
        dealTypes: zod_1.z.array(zod_1.z.string()).optional().default([]),
        minDealValue: zod_1.z.number().min(0).optional().default(0),
        maxDealValue: zod_1.z.number().min(0).optional().nullable(),
    }),
});
exports.updateCommissionRuleSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Rule name cannot be empty').max(200).optional(),
        description: zod_1.z.string().max(5000).optional().nullable(),
        type: zod_1.z.enum(['Percentage', 'Fixed', 'Tiered', 'Formula']).optional(),
        calculation: zod_1.z.string().max(5000).optional().nullable(),
        rate: zod_1.z.number().min(0).optional(),
        tierConfig: zod_1.z.array(zod_1.z.object({
            minValue: zod_1.z.number(),
            maxValue: zod_1.z.number(),
            rate: zod_1.z.number(),
        })).optional(),
        conditions: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional().nullable(),
        productIds: zod_1.z.array(zod_1.z.string()).optional(),
        dealTypes: zod_1.z.array(zod_1.z.string()).optional(),
        minDealValue: zod_1.z.number().min(0).optional(),
        maxDealValue: zod_1.z.number().min(0).optional().nullable(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
exports.approvePayoutSchema = zod_1.z.object({
    body: zod_1.z.object({
        notes: zod_1.z.string().max(2000).optional().nullable(),
    }),
});
