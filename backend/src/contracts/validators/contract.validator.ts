import { z } from 'zod';

export const createContractSchema = z.object({
  body: z.object({
    title: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    description: z.string().max(5000).optional().nullable(),
    type: z.string().optional().nullable(),
    status: z.string().optional(),
    customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
    value: z.number().nonnegative('Value must be non-negative').optional(),
  }),
});

export const updateContractSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Contract name cannot be empty').max(300).optional(),
    description: z.string().max(5000).optional().nullable(),
    type: z.string().optional(),
    status: z.string().optional(),
    customerId: z.string().uuid('Invalid customer ID').optional(),
    startDate: z.string().datetime('Invalid start date format').optional(),
    endDate: z.string().datetime('Invalid end date format').optional().nullable(),
    value: z.number().nonnegative('Value must be non-negative').optional(),
  }),
});
