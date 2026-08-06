import { z } from 'zod';

export const createCalendarSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional().nullable(),
    startTime: z.any().optional().nullable(),
    endTime: z.any().optional().nullable(),
    location: z.string().optional().nullable(),
    organizerId: z.string().optional().nullable().or(z.literal('')),
    customerId: z.string().optional().nullable().or(z.literal('')),
    dealId: z.string().optional().nullable().or(z.literal('')),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateCalendarSchema = z.object({
  body: z.object({
    title: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    startTime: z.any().optional().nullable(),
    endTime: z.any().optional().nullable(),
    location: z.string().optional().nullable(),
    organizerId: z.string().optional().nullable(),
    customerId: z.string().optional().nullable(),
    dealId: z.string().optional().nullable(),
  }),
  params: z.object({
    id: z.string().optional(),
  }),
  query: z.object({}).optional(),
});

export const getCalendarByIdSchema = z.object({
  body: z.any().optional(),
  params: z.object({
    id: z.string().optional(),
  }),
  query: z.any().optional(),
});
