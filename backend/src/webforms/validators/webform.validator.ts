import { z } from 'zod';

export const createWebFormSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Form name is required').max(200),
    description: z.string().max(5000).optional().nullable(),
    fields: z.array(z.object({
      name: z.string(),
      type: z.enum(['text', 'email', 'phone', 'number', 'select', 'checkbox', 'radio', 'textarea', 'date']),
      required: z.boolean().optional().default(false),
      options: z.array(z.string()).optional(),
      label: z.string().optional(),
      placeholder: z.string().optional(),
    })).optional().default([]),
    submitLabel: z.string().max(100).optional().default('Submit'),
    successMessage: z.string().max(1000).optional().nullable(),
    redirectUrl: z.string().url().optional().nullable(),
    notificationEmails: z.array(z.string().email()).optional().default([]),
    assignToId: z.string().uuid('Invalid assignee ID').optional().nullable(),
    sourceId: z.string().uuid('Invalid source ID').optional().nullable(),
    statusId: z.string().uuid('Invalid status ID').optional().nullable(),
  }),
});

export const updateWebFormSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Form name cannot be empty').max(200).optional(),
    description: z.string().max(5000).optional().nullable(),
    fields: z.array(z.object({
      name: z.string(),
      type: z.enum(['text', 'email', 'phone', 'number', 'select', 'checkbox', 'radio', 'textarea', 'date']),
      required: z.boolean().optional().default(false),
      options: z.array(z.string()).optional(),
      label: z.string().optional(),
      placeholder: z.string().optional(),
    })).optional(),
    submitLabel: z.string().max(100).optional(),
    successMessage: z.string().max(1000).optional().nullable(),
    redirectUrl: z.string().url().optional().nullable(),
    notificationEmails: z.array(z.string().email()).optional(),
    assignToId: z.string().uuid('Invalid assignee ID').optional().nullable(),
    sourceId: z.string().uuid('Invalid source ID').optional().nullable(),
    statusId: z.string().uuid('Invalid status ID').optional().nullable(),
  }),
});
