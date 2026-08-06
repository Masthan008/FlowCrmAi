"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentByIdSchema = exports.updatePaymentSchema = exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
exports.createPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        invoiceId: zod_1.z.string().optional().nullable().or(zod_1.z.literal('')),
        amount: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional().nullable(),
        currencyId: zod_1.z.string().optional().nullable().or(zod_1.z.literal('')),
        method: zod_1.z.string().optional().nullable(),
        status: zod_1.z.string().optional().nullable(),
        transactionId: zod_1.z.string().optional().nullable(),
    }),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object({}).optional(),
});
exports.updatePaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        invoiceId: zod_1.z.string().optional().nullable(),
        amount: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional().nullable(),
        currencyId: zod_1.z.string().optional().nullable(),
        method: zod_1.z.string().optional().nullable(),
        status: zod_1.z.string().optional().nullable(),
        transactionId: zod_1.z.string().optional().nullable(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().optional(),
    }),
    query: zod_1.z.object({}).optional(),
});
exports.getPaymentByIdSchema = zod_1.z.object({
    body: zod_1.z.any().optional(),
    params: zod_1.z.object({
        id: zod_1.z.string().optional(),
    }),
    query: zod_1.z.any().optional(),
});
