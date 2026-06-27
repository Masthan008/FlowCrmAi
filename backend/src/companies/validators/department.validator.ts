import { z } from 'zod';

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Department name is required').max(200),
    type: z.string().max(100).optional(),
    managerId: z.string().uuid('Invalid manager ID').optional().or(z.literal('')),
    description: z.string().max(1000).optional().or(z.literal('')),
    revenue: z.number().min(0).optional(),
    status: z.string().max(50).optional(),
    employeeCount: z.number().int().min(0).optional(),
  }),
  params: z.object({ id: z.string().uuid('Invalid company ID') }),
  query: z.object({}).optional(),
});

export const updateDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Department name is required').max(200).optional(),
    type: z.string().max(100).optional(),
    managerId: z.string().uuid('Invalid manager ID').optional().nullable(),
    description: z.string().max(1000).optional().nullable(),
    revenue: z.number().min(0).optional(),
    status: z.string().max(50).optional(),
    employeeCount: z.number().int().min(0).optional(),
  }),
  params: z.object({ id: z.string().uuid('Invalid company ID'), deptId: z.string().uuid('Invalid department ID') }),
  query: z.object({}).optional(),
});
