"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
const orderItemSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid('Invalid product ID'),
    quantity: zod_1.z.number().int().positive('Quantity must be positive'),
    unitPrice: zod_1.z.number().nonnegative('Unit price must be non-negative'),
});
exports.createOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        orderNumber: zod_1.z.string().optional(),
        customerId: zod_1.z.string().uuid('Invalid customer ID'),
        status: zod_1.z.string().optional(),
        total: zod_1.z.number().nonnegative('Total must be non-negative').optional(),
        items: zod_1.z.array(orderItemSchema).optional(),
    }),
});
exports.updateOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.string().optional(),
        total: zod_1.z.number().nonnegative('Total must be non-negative').optional(),
        items: zod_1.z.array(orderItemSchema).optional(),
    }),
});
