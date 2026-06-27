import { z } from 'zod';

export const createActivitySchema = z.object({
  body: z.object({
    type: z.enum(['Call', 'Meeting', 'Email', 'SMS', 'Task', 'Follow-up', 'Demo', 'Visit', 'Custom']),
    title: z.string().min(1, 'Activity title is required').max(200),
    description: z.string().max(2000).optional().or(z.literal('')),
    activityDate: z.string().datetime({ message: 'Invalid activity date format' }),
    status: z.enum(['Planned', 'Completed', 'Cancelled']).optional(),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
    isCompleted: z.boolean().optional(),
    assignedToId: z.string().uuid('Invalid owner ID').optional().or(z.literal('')),
  }),
  params: z.object({
    id: z.string().uuid('Invalid lead ID'),
  }),
  query: z.object({}).optional(),
});

export const updateActivitySchema = z.object({
  body: z.object({
    type: z.enum(['Call', 'Meeting', 'Email', 'SMS', 'Task', 'Follow-up', 'Demo', 'Visit', 'Custom']).optional(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional().or(z.literal('')),
    activityDate: z.string().datetime().optional(),
    status: z.enum(['Planned', 'Completed', 'Cancelled']).optional(),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
    isCompleted: z.boolean().optional(),
    assignedToId: z.string().uuid('Invalid owner ID').optional().or(z.literal('')),
  }),
  params: z.object({
    id: z.string().uuid('Invalid lead ID'),
    activityId: z.string().uuid('Invalid activity ID'),
  }),
  query: z.object({}).optional(),
});
