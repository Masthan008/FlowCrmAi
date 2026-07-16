import { z } from 'zod';

const orderItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
  unitPrice: z.number().nonnegative('Unit price must be non-negative'),
});

export const createOrderSchema = z.object({
  body: z.object({
    orderNumber: z.string().optional(),
    customerId: z.string().uuid('Invalid customer ID'),
    status: z.string().optional(),
    total: z.number().nonnegative('Total must be non-negative').optional(),
    items: z.array(orderItemSchema).optional(),
  }),
});

export const updateOrderSchema = z.object({
  body: z.object({
    status: z.string().optional(),
    total: z.number().nonnegative('Total must be non-negative').optional(),
    items: z.array(orderItemSchema).optional(),
  }),
});
