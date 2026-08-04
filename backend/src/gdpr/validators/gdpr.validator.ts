import { z } from 'zod';

export const recordConsentSchema = z.object({
  body: z.object({
    contactId: z.string().uuid('Invalid contact ID').optional().nullable(),
    companyId: z.string().uuid('Invalid company ID').optional().nullable(),
    contactName: z.string().optional().nullable(),
    contactEmail: z.string().optional().nullable(),
    purpose: z.string().optional().nullable(),
    type: z.string().optional().default('Marketing'),
    granted: z.boolean().optional().default(true),
    source: z.string().optional().default('Manual'),
    ipAddress: z.string().optional().nullable(),
    expiresAt: z.string().optional().nullable(),
    details: z.any().optional().nullable(),
  }),
});

export const createDataRequestSchema = z.object({
  body: z.object({
    contactId: z.string().uuid('Invalid contact ID').optional().nullable(),
    companyId: z.string().uuid('Invalid company ID').optional().nullable(),
    requestorName: z.string().optional().nullable(),
    requestorEmail: z.string().optional().nullable(),
    type: z.string().optional().default('Access'),
    description: z.string().max(5000).optional().nullable(),
  }),
});
