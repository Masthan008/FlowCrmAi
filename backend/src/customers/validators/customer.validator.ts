import { z } from 'zod';

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
    phone: z.string().optional().nullable().or(z.literal('')),
    type: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    companyId: z.string().optional().nullable().or(z.literal('')),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    type: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    companyId: z.string().optional().nullable(),
  }),
  params: z.object({
    id: z.string().optional(),
  }),
  query: z.object({}).optional(),
});

export const getCustomerByIdSchema = z.object({
  body: z.any().optional(),
  params: z.object({
    id: z.string().optional(),
  }),
  query: z.any().optional(),
});
