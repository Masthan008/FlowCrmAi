import { z } from 'zod';

export const createAssetSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Asset name is required').max(200),
    type: z.enum(['Hardware', 'Software', 'License', 'Equipment', 'Vehicle', 'Other']).optional().default('Hardware'),
    serialNumber: z.string().max(200).optional().nullable(),
    assetTag: z.string().max(200).optional().nullable(),
    description: z.string().max(5000).optional().nullable(),
    purchaseDate: z.string().datetime('Invalid date format').optional().nullable(),
    purchasePrice: z.number().min(0).optional().default(0),
    currentValue: z.number().min(0).optional().default(0),
    currency: z.string().max(3).optional().default('USD'),
    warrantyExpiry: z.string().datetime('Invalid date format').optional().nullable(),
    location: z.string().max(500).optional().nullable(),
    vendor: z.string().max(200).optional().nullable(),
    notes: z.string().max(5000).optional().nullable(),
    tags: z.array(z.string()).optional().default([]),
  }),
});

export const updateAssetSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Asset name cannot be empty').max(200).optional(),
    type: z.enum(['Hardware', 'Software', 'License', 'Equipment', 'Vehicle', 'Other']).optional(),
    serialNumber: z.string().max(200).optional().nullable(),
    assetTag: z.string().max(200).optional().nullable(),
    description: z.string().max(5000).optional().nullable(),
    purchaseDate: z.string().datetime('Invalid date format').optional().nullable(),
    purchasePrice: z.number().min(0).optional(),
    currentValue: z.number().min(0).optional(),
    currency: z.string().max(3).optional(),
    warrantyExpiry: z.string().datetime('Invalid date format').optional().nullable(),
    location: z.string().max(500).optional().nullable(),
    vendor: z.string().max(200).optional().nullable(),
    notes: z.string().max(5000).optional().nullable(),
    tags: z.array(z.string()).optional(),
    status: z.string().optional(),
  }),
});

export const assignAssetSchema = z.object({
  body: z.object({
    assignedToId: z.string().uuid('Invalid employee ID').optional().nullable(),
    customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
  }),
});
