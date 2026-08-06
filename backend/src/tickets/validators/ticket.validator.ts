import { z } from 'zod';

export const createTicketSchema = z.object({
  body: z.object({
    subject: z.string().optional().nullable(),
    title: z.string().optional().nullable(),
    description: z.string().max(5000).optional().nullable(),
    status: z.string().optional(),
    priority: z.string().optional(),
    category: z.string().optional(),
    customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
    assignedToId: z.string().uuid('Invalid assignee ID').optional().nullable(),
  }),
});

export const updateTicketSchema = z.object({
  body: z.object({
    subject: z.string().min(1, 'Subject cannot be empty').max(500).optional(),
    description: z.string().max(5000).optional().nullable(),
    status: z.string().optional(),
    priority: z.string().optional(),
    category: z.string().optional(),
    customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
    assignedToId: z.string().uuid('Invalid assignee ID').optional().nullable(),
  }),
});

export const createTicketCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Comment content is required').max(5000),
  }),
});

export const createTicketTimeLogSchema = z.object({
  body: z.object({
    hours: z.number().positive('Hours must be positive'),
    description: z.string().max(2000).optional().nullable(),
    loggedAt: z.string().datetime('Invalid datetime format').optional().nullable(),
  }),
});
