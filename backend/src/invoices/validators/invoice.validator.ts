import { z } from 'zod';

export const createInvoiceSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid customer ID'),
    dealId: z.string().uuid('Invalid deal ID').optional().nullable(),
    dueDate: z.string().datetime('Invalid date format for due date'),
    taxRate: z.number().min(0, 'Tax rate must be positive').optional(),
    discount: z.number().min(0, 'Discount must be positive').optional(),
    items: z.array(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        unitPrice: z.number().min(0, 'Price must be positive'),
      })
    ).min(1, 'Invoice must contain at least 1 item'),
  }),
});

export const updateInvoiceSchema = z.object({
  body: z.object({
    status: z.enum(['unpaid', 'partially_paid', 'paid', 'overdue', 'cancelled']).optional(),
    dueDate: z.string().datetime('Invalid date format').optional(),
    taxRate: z.number().min(0, 'Tax rate must be positive').optional(),
    discount: z.number().min(0, 'Discount must be positive').optional(),
    items: z.array(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        unitPrice: z.number().min(0, 'Price must be positive'),
      })
    ).optional(),
  }),
});

export const recordPaymentSchema = z.object({
  body: z.object({
    amount: z.number().min(0.01, 'Payment amount must be positive'),
    paymentMethod: z.string().min(1, 'Payment method is required'),
    transactionId: z.string().max(100).optional().nullable(),
  }),
});
