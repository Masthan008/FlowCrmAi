import { z } from 'zod';

export const createSurveySchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Survey title is required').max(300),
    description: z.string().max(5000).optional().nullable(),
    type: z.enum(['NPS', 'CSAT', 'CES', 'Custom']).optional().default('NPS'),
    questions: z.array(z.object({
      id: z.string(),
      type: z.enum(['rating', 'single_choice', 'multiple_choice', 'text', 'boolean']),
      question: z.string(),
      options: z.array(z.string()).optional(),
      required: z.boolean().optional().default(false),
    })).optional().default([]),
    targetAudience: z.record(z.string(), z.any()).optional().nullable(),
    sendMethod: z.enum(['Email', 'Portal', 'Link']).optional().default('Email'),
    templateId: z.string().uuid('Invalid template ID').optional().nullable(),
  }),
});

export const updateSurveySchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Survey title cannot be empty').max(300).optional(),
    description: z.string().max(5000).optional().nullable(),
    type: z.enum(['NPS', 'CSAT', 'CES', 'Custom']).optional(),
    questions: z.array(z.object({
      id: z.string(),
      type: z.enum(['rating', 'single_choice', 'multiple_choice', 'text', 'boolean']),
      question: z.string(),
      options: z.array(z.string()).optional(),
      required: z.boolean().optional().default(false),
    })).optional(),
    targetAudience: z.record(z.string(), z.any()).optional().nullable(),
    sendMethod: z.enum(['Email', 'Portal', 'Link']).optional(),
    templateId: z.string().uuid('Invalid template ID').optional().nullable(),
  }),
});

export const surveyResponseSchema = z.object({
  body: z.object({
    contactId: z.string().uuid('Invalid contact ID').optional().nullable(),
    customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
    answers: z.record(z.string(), z.any()),
    score: z.number().int().optional().nullable(),
    comment: z.string().max(5000).optional().nullable(),
  }),
});
