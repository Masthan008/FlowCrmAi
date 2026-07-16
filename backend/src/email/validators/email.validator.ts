import { z } from 'zod';

export const createAccountSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    displayName: z.string().max(200).optional().nullable(),
    provider: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const updateAccountSchema = z.object({
  body: z.object({
    displayName: z.string().max(200).optional().nullable(),
    provider: z.string().optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const sendEmailSchema = z.object({
  body: z.object({
    accountId: z.string().uuid('Invalid account ID'),
    to: z.array(z.string().email('Invalid recipient email')).min(1, 'At least one recipient is required'),
    cc: z.array(z.string().email('Invalid CC email')).optional(),
    bcc: z.array(z.string().email('Invalid BCC email')).optional(),
    subject: z.string().min(1, 'Subject is required').max(500),
    body: z.string().min(1, 'Body is required'),
  }),
});
