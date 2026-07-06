import { z } from 'zod';

export const createMeetingSchema = z.object({
  body: z.object({
    organizerId: z.string().uuid('Invalid organizer ID'),
    customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
    dealId: z.string().uuid('Invalid deal ID').optional().nullable(),
    title: z.string().min(1, 'Meeting title is required').max(200),
    description: z.string().max(2000).optional().nullable(),
    startTime: z.string().datetime('Invalid start time format'),
    endTime: z.string().datetime('Invalid end time format'),
    location: z.string().max(300).optional().nullable(),
  }),
});

export const updateMeetingSchema = z.object({
  body: z.object({
    organizerId: z.string().uuid('Invalid organizer ID').optional(),
    customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
    dealId: z.string().uuid('Invalid deal ID').optional().nullable(),
    title: z.string().min(1, 'Meeting title cannot be empty').max(200).optional(),
    description: z.string().max(2000).optional().nullable(),
    startTime: z.string().datetime('Invalid start time format').optional(),
    endTime: z.string().datetime('Invalid end time format').optional(),
    location: z.string().max(300).optional().nullable(),
  }),
});
