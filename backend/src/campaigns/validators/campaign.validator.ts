import { z } from 'zod';

export const createCampaignSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Campaign name is required').max(200),
    description: z.string().max(2000).optional().nullable(),
    type: z.string().min(1, 'Campaign type is required'),
    status: z.string().optional(),
    scheduledAt: z.string().datetime('Invalid scheduled time format').optional().nullable(),
  }),
});

export const updateCampaignSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Campaign name cannot be empty').max(200).optional(),
    description: z.string().max(2000).optional().nullable(),
    type: z.string().optional(),
    status: z.string().optional(),
    scheduledAt: z.string().datetime('Invalid scheduled time format').optional().nullable(),
  }),
});

export const createCampaignListSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'List name is required').max(200),
    description: z.string().max(2000).optional().nullable(),
  }),
});

export const createCampaignEmailSchema = z.object({
  body: z.object({
    subject: z.string().min(1, 'Email subject is required').max(500),
    body: z.string().min(1, 'Email body is required'),
    order: z.number().int().optional(),
  }),
});

export const updateCampaignEmailSchema = z.object({
  body: z.object({
    subject: z.string().min(1, 'Email subject cannot be empty').max(500).optional(),
    body: z.string().min(1, 'Email body cannot be empty').optional(),
    order: z.number().int().optional(),
  }),
});
