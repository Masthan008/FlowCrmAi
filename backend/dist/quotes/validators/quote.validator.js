"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateQuoteSchema = exports.createQuoteSchema = void 0;
const zod_1 = require("zod");
exports.createQuoteSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerId: zod_1.z.string().uuid('Invalid customer ID'),
        dealId: zod_1.z.string().uuid('Invalid deal ID').optional().nullable(),
        validUntil: zod_1.z.string().datetime('Invalid date format for validity limit'),
        taxRate: zod_1.z.number().min(0, 'Tax rate must be positive').optional(),
        discount: zod_1.z.number().min(0, 'Discount must be positive').optional(),
        items: zod_1.z.array(zod_1.z.object({
            productId: zod_1.z.string().uuid('Invalid product ID'),
            quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1'),
            unitPrice: zod_1.z.number().min(0, 'Price must be positive'),
        })).min(1, 'Quote must contain at least 1 item'),
    }),
});
exports.updateQuoteSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['draft', 'sent', 'accepted', 'expired', 'declined']).optional(),
        validUntil: zod_1.z.string().datetime('Invalid date format').optional(),
        taxRate: zod_1.z.number().min(0, 'Tax rate must be positive').optional(),
        discount: zod_1.z.number().min(0, 'Discount must be positive').optional(),
        items: zod_1.z.array(zod_1.z.object({
            productId: zod_1.z.string().uuid('Invalid product ID'),
            quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1'),
            unitPrice: zod_1.z.number().min(0, 'Price must be positive'),
        })).optional(),
    }),
});
