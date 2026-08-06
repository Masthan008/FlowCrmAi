import { z } from 'zod';

export const createPaymentSchema = z.object({
  body: z.object({
    invoiceId: z.string().optional().nullable().or(z.literal('')),
    amount: z.union([z.number(), z.string()]).optional().nullable(),
    currencyId: z.string().optional().nullable().or(z.literal('')),
    method: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    transactionId: z.string().optional().nullable(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updatePaymentSchema = z.object({
  body: z.object({
    invoiceId: z.string().optional().nullable(),
    amount: z.union([z.number(), z.string()]).optional().nullable(),
    currencyId: z.string().optional().nullable(),
    method: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    transactionId: z.string().optional().nullable(),
  }),
  params: z.object({
    id: z.string().optional(),
  }),
  query: z.object({}).optional(),
});

export const getPaymentByIdSchema = z.object({
  body: z.any().optional(),
  params: z.object({
    id: z.string().optional(),
  }),
  query: z.any().optional(),
});
