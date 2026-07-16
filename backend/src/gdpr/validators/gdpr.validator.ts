import { z } from 'zod';

export const recordConsentSchema = z.object({
  body: z.object({
    contactId: z.string().uuid('Invalid contact ID').optional().nullable(),
    companyId: z.string().uuid('Invalid company ID').optional().nullable(),
    type: z.enum(['Marketing', 'Analytics', 'ThirdParty', 'Cookies', 'Communications']),
    granted: z.boolean().optional().default(true),
    source: z.enum(['Form', 'Portal', 'Email', 'Manual']),
    ipAddress: z.string().optional().nullable(),
    expiresAt: z.string().datetime('Invalid date format').optional().nullable(),
    details: z.record(z.string(), z.any()).optional().nullable(),
  }),
});

export const createDataRequestSchema = z.object({
  body: z.object({
    contactId: z.string().uuid('Invalid contact ID').optional().nullable(),
    companyId: z.string().uuid('Invalid company ID').optional().nullable(),
    type: z.enum(['Access', 'Rectification', 'Erasure', 'Portability', 'Restrict', 'Object']),
    description: z.string().max(5000).optional().nullable(),
  }),
});
