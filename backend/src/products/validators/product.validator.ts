import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid('Invalid category ID'),
    name: z.string().min(1, 'Product name is required').max(200),
    sku: z.string().min(1, 'Product SKU is required').max(100),
    price: z.number().min(0, 'Price must be positive'),
    isActive: z.boolean().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid('Invalid category ID').optional(),
    name: z.string().min(1, 'Product name cannot be empty').max(200).optional(),
    sku: z.string().min(1, 'Product SKU cannot be empty').max(100).optional(),
    price: z.number().min(0, 'Price must be positive').optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required').max(100),
    description: z.string().max(500).optional(),
  }),
});
