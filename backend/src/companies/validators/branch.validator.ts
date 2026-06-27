import { z } from 'zod';

export const createBranchSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Branch name is required').max(200),
    branchCode: z.string().max(50).optional().or(z.literal('')),
    branchType: z.string().max(100).optional().or(z.literal('')),
    managerId: z.string().uuid('Invalid manager ID').optional().or(z.literal('')),
    phone: z.string().max(50).optional().or(z.literal('')),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    address: z.string().max(500).optional().or(z.literal('')),
    gst: z.string().max(50).optional().or(z.literal('')),
    country: z.string().max(100).optional().or(z.literal('')),
    state: z.string().max(100).optional().or(z.literal('')),
    city: z.string().max(100).optional().or(z.literal('')),
    employeeCount: z.number().int().min(0).optional(),
    revenue: z.number().min(0).optional(),
    status: z.string().max(50).optional(),
    openingDate: z.string().optional().or(z.literal('')),
    timezone: z.string().max(50).optional().or(z.literal('')),
  }),
  params: z.object({ id: z.string().uuid('Invalid company ID') }),
  query: z.object({}).optional(),
});

export const updateBranchSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Branch name is required').max(200).optional(),
    branchCode: z.string().max(50).optional().or(z.literal('')),
    branchType: z.string().max(100).optional().or(z.literal('')),
    managerId: z.string().uuid('Invalid manager ID').optional().nullable(),
    phone: z.string().max(50).optional().or(z.literal('')),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    address: z.string().max(500).optional().or(z.literal('')),
    gst: z.string().max(50).optional().or(z.literal('')),
    country: z.string().max(100).optional().or(z.literal('')),
    state: z.string().max(100).optional().or(z.literal('')),
    city: z.string().max(100).optional().or(z.literal('')),
    employeeCount: z.number().int().min(0).optional(),
    revenue: z.number().min(0).optional(),
    status: z.string().max(50).optional(),
    openingDate: z.string().optional().nullable(),
    timezone: z.string().max(50).optional().or(z.literal('')),
  }),
  params: z.object({ id: z.string().uuid('Invalid company ID'), branchId: z.string().uuid('Invalid branch ID') }),
  query: z.object({}).optional(),
});
