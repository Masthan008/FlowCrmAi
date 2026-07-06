import { z } from 'zod';

export const createQuoteSchema = z.object({
  body: z.object({
    customerId: z.string().uuid('Invalid customer ID'),
    dealId: z.string().uuid('Invalid deal ID').optional().nullable(),
    validUntil: z.string().datetime('Invalid date format for validity limit'),
    taxRate: z.number().min(0, 'Tax rate must be positive').optional(),
    discount: z.number().min(0, 'Discount must be positive').optional(),
    items: z.array(
      z.object({
        productId: z.string().uuid('Invalid product ID'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        unitPrice: z.number().min(0, 'Price must be positive'),
      })
    ).min(1, 'Quote must contain at least 1 item'),
  }),
});

export const updateQuoteSchema = z.object({
  body: z.object({
    status: z.enum(['draft', 'sent', 'accepted', 'expired', 'declined']).optional(),
    validUntil: z.string().datetime('Invalid date format').optional(),
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
