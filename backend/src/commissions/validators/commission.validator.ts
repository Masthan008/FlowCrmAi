import { z } from 'zod';

export const createCommissionRuleSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Rule name is required').max(200),
    description: z.string().max(5000).optional().nullable(),
    type: z.enum(['Percentage', 'Fixed', 'Tiered', 'Formula']).optional().default('Percentage'),
    calculation: z.string().max(5000).optional().nullable(),
    rate: z.number().min(0).optional().default(0),
    tierConfig: z.array(z.object({
      minValue: z.number(),
      maxValue: z.number(),
      rate: z.number(),
    })).optional().default([]),
    conditions: z.record(z.string(), z.any()).optional().nullable(),
    productIds: z.array(z.string()).optional().default([]),
    dealTypes: z.array(z.string()).optional().default([]),
    minDealValue: z.number().min(0).optional().default(0),
    maxDealValue: z.number().min(0).optional().nullable(),
  }),
});

export const updateCommissionRuleSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Rule name cannot be empty').max(200).optional(),
    description: z.string().max(5000).optional().nullable(),
    type: z.enum(['Percentage', 'Fixed', 'Tiered', 'Formula']).optional(),
    calculation: z.string().max(5000).optional().nullable(),
    rate: z.number().min(0).optional(),
    tierConfig: z.array(z.object({
      minValue: z.number(),
      maxValue: z.number(),
      rate: z.number(),
    })).optional(),
    conditions: z.record(z.string(), z.any()).optional().nullable(),
    productIds: z.array(z.string()).optional(),
    dealTypes: z.array(z.string()).optional(),
    minDealValue: z.number().min(0).optional(),
    maxDealValue: z.number().min(0).optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const approvePayoutSchema = z.object({
  body: z.object({
    notes: z.string().max(2000).optional().nullable(),
  }),
});
