"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordPaymentSchema = exports.updateInvoiceSchema = exports.createInvoiceSchema = void 0;
const zod_1 = require("zod");
exports.createInvoiceSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerId: zod_1.z.string().uuid('Invalid customer ID'),
        dealId: zod_1.z.string().uuid('Invalid deal ID').optional().nullable(),
        dueDate: zod_1.z.string().datetime('Invalid date format for due date'),
        taxRate: zod_1.z.number().min(0, 'Tax rate must be positive').optional(),
        discount: zod_1.z.number().min(0, 'Discount must be positive').optional(),
        items: zod_1.z.array(zod_1.z.object({
            productId: zod_1.z.string().uuid('Invalid product ID'),
            quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1'),
            unitPrice: zod_1.z.number().min(0, 'Price must be positive'),
        })).min(1, 'Invoice must contain at least 1 item'),
    }),
});
exports.updateInvoiceSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['unpaid', 'partially_paid', 'paid', 'overdue', 'cancelled']).optional(),
        dueDate: zod_1.z.string().datetime('Invalid date format').optional(),
        taxRate: zod_1.z.number().min(0, 'Tax rate must be positive').optional(),
        discount: zod_1.z.number().min(0, 'Discount must be positive').optional(),
        items: zod_1.z.array(zod_1.z.object({
            productId: zod_1.z.string().uuid('Invalid product ID'),
            quantity: zod_1.z.number().int().min(1, 'Quantity must be at least 1'),
            unitPrice: zod_1.z.number().min(0, 'Price must be positive'),
        })).optional(),
    }),
});
exports.recordPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        amount: zod_1.z.number().min(0.01, 'Payment amount must be positive'),
        paymentMethod: zod_1.z.string().min(1, 'Payment method is required'),
        transactionId: zod_1.z.string().max(100).optional().nullable(),
    }),
});
