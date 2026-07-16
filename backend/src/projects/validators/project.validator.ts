import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Project name is required').max(300),
    description: z.string().max(5000).optional().nullable(),
    status: z.string().optional(),
    priority: z.string().optional(),
    ownerId: z.string().uuid('Invalid owner ID').optional().nullable(),
    startDate: z.string().datetime('Invalid start date format').optional().nullable(),
    endDate: z.string().datetime('Invalid end date format').optional().nullable(),
    budget: z.number().nonnegative('Budget must be non-negative').optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Project name cannot be empty').max(300).optional(),
    description: z.string().max(5000).optional().nullable(),
    status: z.string().optional(),
    priority: z.string().optional(),
    ownerId: z.string().uuid('Invalid owner ID').optional().nullable(),
    startDate: z.string().datetime('Invalid start date format').optional().nullable(),
    endDate: z.string().datetime('Invalid end date format').optional().nullable(),
    budget: z.number().nonnegative('Budget must be non-negative').optional(),
  }),
});

export const createMilestoneSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Milestone name is required').max(300),
    description: z.string().max(5000).optional().nullable(),
    dueDate: z.string().datetime('Invalid due date format').optional().nullable(),
    status: z.string().optional(),
  }),
});

export const updateMilestoneSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Milestone name cannot be empty').max(300).optional(),
    description: z.string().max(5000).optional().nullable(),
    dueDate: z.string().datetime('Invalid due date format').optional().nullable(),
    status: z.string().optional(),
  }),
});
