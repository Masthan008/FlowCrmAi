import { z } from 'zod';

export const createBusinessNetworkSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(200),
    relatedCompanyId: z.string().uuid('Invalid company ID').optional().nullable(),
    relationshipType: z.string().max(100).optional(),
    description: z.string().max(1000).optional().or(z.literal('')),
    status: z.string().max(50).optional(),
    website: z.string().max(200).optional().or(z.literal('')),
  }),
  params: z.object({ id: z.string().uuid('Invalid company ID') }),
  query: z.object({}).optional(),
});

export const updateBusinessNetworkSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(200).optional(),
    relatedCompanyId: z.string().uuid('Invalid company ID').optional().nullable(),
    relationshipType: z.string().max(100).optional(),
    description: z.string().max(1000).optional().nullable(),
    status: z.string().max(50).optional(),
    website: z.string().max(200).optional().nullable(),
  }),
  params: z.object({ id: z.string().uuid('Invalid company ID'), entryId: z.string().uuid('Invalid entry ID') }),
  query: z.object({}).optional(),
});
