import { z } from 'zod';

export const createChatConversationSchema = z.object({
  body: z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
    visitorName: z.string().max(200).optional().nullable(),
    visitorEmail: z.string().email('Invalid email').optional().nullable(),
    visitorPhone: z.string().max(50).optional().nullable(),
    pageUrl: z.string().max(2000).optional().nullable(),
    customerId: z.string().uuid('Invalid customer ID').optional().nullable(),
    companyId: z.string().uuid('Invalid company ID').optional().nullable(),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Message content is required'),
    senderType: z.enum(['Visitor', 'Agent', 'System']).optional().default('Visitor'),
    senderId: z.string().uuid('Invalid sender ID').optional().nullable(),
    contentType: z.enum(['Text', 'Image', 'File', 'System']).optional().default('Text'),
    fileUrl: z.string().url().optional().nullable(),
  }),
});

export const assignConversationSchema = z.object({
  body: z.object({
    assignedToId: z.string().uuid('Invalid agent ID'),
  }),
});

export const rateConversationSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5),
    ratingComment: z.string().max(1000).optional().nullable(),
  }),
});
