import { z } from 'zod';

export const createPortalUserSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional().nullable(),
    name: z.string().optional().nullable(),
    company: z.string().optional().nullable(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    permissions: z.array(z.string()).optional().default([]),
  }),
});

export const updatePortalUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters').optional().nullable(),
    name: z.string().optional().nullable(),
    company: z.string().optional().nullable(),
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    permissions: z.array(z.string()).optional(),
  }),
});

export const portalLoginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const portalRegisterSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid customer ID'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
  }),
});
