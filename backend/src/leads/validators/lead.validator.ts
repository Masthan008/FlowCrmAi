import { z } from 'zod';

/**
 * Validation: Create Lead
 */
export const createLeadSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    phone: z
      .string()
      .regex(/^[+]?[\d\s\-().]{7,20}$/, 'Invalid phone number format')
      .optional()
      .or(z.literal('')),
    alternatePhone: z
      .string()
      .regex(/^[+]?[\d\s\-().]{7,20}$/, 'Invalid phone number format')
      .optional()
      .or(z.literal('')),
    companyName: z.string().max(200).optional().or(z.literal('')),
    jobTitle: z.string().max(150).optional().or(z.literal('')),
    industry: z.string().max(100).optional().or(z.literal('')),
    website: z
      .string()
      .url('Invalid website URL')
      .optional()
      .or(z.literal('')),
    address: z.string().max(500).optional().or(z.literal('')),
    city: z.string().max(100).optional().or(z.literal('')),
    state: z.string().max(100).optional().or(z.literal('')),
    country: z.string().max(100).optional().or(z.literal('')),
    postalCode: z.string().max(20).optional().or(z.literal('')),
    sourceId: z.string().uuid('Invalid source ID').optional().or(z.literal('')),
    statusId: z.string().uuid('Invalid status ID').optional().or(z.literal('')),
    assignedToId: z.string().uuid('Invalid owner ID').optional().or(z.literal('')),
    priority: z.enum(['Critical', 'High', 'Medium', 'Low']).optional(),
    rating: z.number().int().min(0).max(5).optional(),
    value: z.number().min(0).optional(),
    expectedClosingDate: z.string().datetime({ offset: true }).optional().or(z.literal('')),
    description: z.string().max(5000).optional().or(z.literal('')),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

/**
 * Validation: Update Lead
 */
export const updateLeadSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    phone: z
      .string()
      .regex(/^[+]?[\d\s\-().]{7,20}$/, 'Invalid phone number format')
      .optional()
      .or(z.literal('')),
    alternatePhone: z
      .string()
      .regex(/^[+]?[\d\s\-().]{7,20}$/, 'Invalid phone number format')
      .optional()
      .or(z.literal('')),
    companyName: z.string().max(200).optional().or(z.literal('')),
    jobTitle: z.string().max(150).optional().or(z.literal('')),
    industry: z.string().max(100).optional().or(z.literal('')),
    website: z
      .string()
      .url('Invalid website URL')
      .optional()
      .or(z.literal('')),
    address: z.string().max(500).optional().or(z.literal('')),
    city: z.string().max(100).optional().or(z.literal('')),
    state: z.string().max(100).optional().or(z.literal('')),
    country: z.string().max(100).optional().or(z.literal('')),
    postalCode: z.string().max(20).optional().or(z.literal('')),
    sourceId: z.string().uuid('Invalid source ID').optional().or(z.literal('')),
    statusId: z.string().uuid('Invalid status ID').optional().or(z.literal('')),
    assignedToId: z.string().uuid('Invalid owner ID').optional().or(z.literal('')),
    priority: z.enum(['Critical', 'High', 'Medium', 'Low']).optional(),
    rating: z.number().int().min(0).max(5).optional(),
    value: z.number().min(0).optional(),
    expectedClosingDate: z.string().datetime({ offset: true }).optional().or(z.literal('')),
    description: z.string().max(5000).optional().or(z.literal('')),
  }),
  params: z.object({
    id: z.string().uuid('Invalid lead ID'),
  }),
  query: z.object({}).optional(),
});

/**
 * Validation: Update Status
 */
export const updateStatusSchema = z.object({
  body: z.object({
    statusId: z.string().uuid('Invalid status ID'),
  }),
  params: z.object({
    id: z.string().uuid('Invalid lead ID'),
  }),
  query: z.object({}).optional(),
});

/**
 * Validation: Update Owner
 */
export const updateOwnerSchema = z.object({
  body: z.object({
    assignedToId: z.string().uuid('Invalid owner ID'),
  }),
  params: z.object({
    id: z.string().uuid('Invalid lead ID'),
  }),
  query: z.object({}).optional(),
});

/**
 * Validation: Update Priority
 */
export const updatePrioritySchema = z.object({
  body: z.object({
    priority: z.enum(['Critical', 'High', 'Medium', 'Low']),
  }),
  params: z.object({
    id: z.string().uuid('Invalid lead ID'),
  }),
  query: z.object({}).optional(),
});

/**
 * Validation: Update Rating
 */
export const updateRatingSchema = z.object({
  body: z.object({
    rating: z.number().int().min(0).max(5),
  }),
  params: z.object({
    id: z.string().uuid('Invalid lead ID'),
  }),
  query: z.object({}).optional(),
});

/**
 * Validation: List Leads Query Params
 */
export const listLeadsSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().optional(),
    status: z.string().uuid().optional(),
    source: z.string().uuid().optional(),
    priority: z.string().optional(),
    owner: z.string().uuid().optional(),
    sortBy: z.string().optional(),
    sortDir: z.enum(['asc', 'desc']).optional(),
  }),
});

/**
 * Validation: Get by ID param
 */
export const getLeadByIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid('Invalid lead ID'),
  }),
  query: z.object({}).optional(),
});
