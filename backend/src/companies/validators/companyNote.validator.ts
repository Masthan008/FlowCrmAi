import { z } from 'zod';

export const createCompanyNoteSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Note content is required').max(10000),
    title: z.string().max(200).optional().or(z.literal('')),
    isPinned: z.boolean().optional(),
  }),
  params: z.object({ id: z.string().uuid('Invalid company ID') }),
  query: z.object({}).optional(),
});

export const updateCompanyNoteSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Note content is required').max(10000),
    title: z.string().max(200).optional().or(z.literal('')),
    isPinned: z.boolean().optional(),
  }),
  params: z.object({ id: z.string().uuid('Invalid company ID'), noteId: z.string().uuid('Invalid note ID') }),
  query: z.object({}).optional(),
});
