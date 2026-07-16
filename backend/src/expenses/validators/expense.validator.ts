import { z } from 'zod';

export const createExpenseSchema = z.object({
  body: z.object({
    employeeId: z.string().uuid('Invalid employee ID'),
    categoryId: z.string().uuid('Invalid category ID').optional().nullable(),
    amount: z.number().positive('Amount must be positive'),
    currency: z.string().max(3).optional().default('USD'),
    description: z.string().max(5000).optional().nullable(),
    date: z.string().datetime('Invalid date format'),
    receiptUrl: z.string().url().optional().nullable(),
    dealId: z.string().uuid('Invalid deal ID').optional().nullable(),
    projectId: z.string().uuid('Invalid project ID').optional().nullable(),
    billable: z.boolean().optional().default(false),
    taxRelevant: z.boolean().optional().default(false),
    tags: z.array(z.string()).optional().default([]),
  }),
});

export const updateExpenseSchema = z.object({
  body: z.object({
    employeeId: z.string().uuid('Invalid employee ID').optional(),
    categoryId: z.string().uuid('Invalid category ID').optional().nullable(),
    amount: z.number().positive('Amount must be positive').optional(),
    currency: z.string().max(3).optional(),
    description: z.string().max(5000).optional().nullable(),
    date: z.string().datetime('Invalid date format').optional(),
    receiptUrl: z.string().url().optional().nullable(),
    dealId: z.string().uuid('Invalid deal ID').optional().nullable(),
    projectId: z.string().uuid('Invalid project ID').optional().nullable(),
    billable: z.boolean().optional(),
    taxRelevant: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const createExpenseCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required').max(200),
    description: z.string().max(2000).optional().nullable(),
    icon: z.string().max(100).optional().nullable(),
  }),
});

export const updateExpenseCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name cannot be empty').max(200).optional(),
    description: z.string().max(2000).optional().nullable(),
    icon: z.string().max(100).optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});
