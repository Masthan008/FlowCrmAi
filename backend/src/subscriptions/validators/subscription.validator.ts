import { z } from 'zod';

export const createPlanSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Plan name is required').max(200),
    description: z.string().max(2000).optional().nullable(),
    price: z.number().nonnegative('Price must be non-negative'),
    interval: z.string().min(1, 'Billing interval is required'),
    features: z.any().optional(),
  }),
});

export const updatePlanSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Plan name cannot be empty').max(200).optional(),
    description: z.string().max(2000).optional().nullable(),
    price: z.number().nonnegative('Price must be non-negative').optional(),
    interval: z.string().optional(),
    features: z.any().optional(),
  }),
});

export const createSubscriptionSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid customer ID'),
    planId: z.string().uuid('Invalid plan ID'),
    status: z.string().optional(),
    startDate: z.string().datetime('Invalid start date format'),
    endDate: z.string().datetime('Invalid end date format').optional().nullable(),
  }),
});

export const updateSubscriptionSchema = z.object({
  body: z.object({
    status: z.string().optional(),
    planId: z.string().uuid('Invalid plan ID').optional(),
    endDate: z.string().datetime('Invalid end date format').optional().nullable(),
  }),
});
