import { z } from 'zod';

export const createArticleSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(300),
    content: z.string().min(1, 'Content is required'),
    categoryId: z.string().uuid('Invalid category ID').optional().nullable(),
    status: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const updateArticleSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title cannot be empty').max(300).optional(),
    content: z.string().min(1, 'Content cannot be empty').optional(),
    categoryId: z.string().uuid('Invalid category ID').optional().nullable(),
    status: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name is required').max(200),
    description: z.string().max(2000).optional().nullable(),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Category name cannot be empty').max(200).optional(),
    description: z.string().max(2000).optional().nullable(),
  }),
});

export const voteArticleSchema = z.object({
  body: z.object({
    vote: z.string().optional().nullable(),
    helpful: z.boolean().optional().nullable(),
  }),
});
