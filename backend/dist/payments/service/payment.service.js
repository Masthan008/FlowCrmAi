"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = void 0;
const payment_repository_1 = require("../repository/payment.repository");
const db_1 = require("../../database/db");
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (val) => typeof val === 'string' && UUID_REGEX.test(val);
exports.paymentService = {
    list: async (params) => {
        return payment_repository_1.paymentRepository.findMany(params);
    },
    getById: async (id) => {
        const payment = await payment_repository_1.paymentRepository.findById(id);
        if (!payment) {
            throw Object.assign(new Error('Payment record not found'), { statusCode: 404 });
        }
        return payment;
    },
    create: async (data, userId) => {
        // Currency fallback
        let currencyId = isUuid(data.currencyId) ? data.currencyId : null;
        if (!currencyId) {
            let usd = await db_1.prisma.currency.findFirst({ where: { code: 'USD' } });
            if (!usd) {
                usd = await db_1.prisma.currency.create({
                    data: { code: 'USD', name: 'US Dollar', symbol: '$' }
                });
            }
            currencyId = usd.id;
        }
        // Invoice fallback
        let invoiceId = isUuid(data.invoiceId) ? data.invoiceId : null;
        if (!invoiceId) {
            let firstInvoice = await db_1.prisma.invoice.findFirst();
            if (!firstInvoice) {
                let firstCust = await db_1.prisma.customer.findFirst();
                if (!firstCust) {
                    firstCust = await db_1.prisma.customer.create({
                        data: { name: 'Default Enterprise Client', type: 'client', status: 'active' }
                    });
                }
                firstInvoice = await db_1.prisma.invoice.create({
                    data: {
                        number: `INV-${Date.now().toString().substring(5)}`,
                        customerId: firstCust.id,
                        total: Number(data.amount) || 100.00,
                        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                        status: 'unpaid',
                    }
                });
            }
            invoiceId = firstInvoice.id;
        }
        const payload = {
            invoiceId,
            currencyId,
            amount: Number(data.amount) || 0,
            method: data.method || 'Credit Card',
            status: data.status || 'completed',
            transactionId: data.transactionId || `TXN-${Date.now()}`,
            createdBy: userId || null,
        };
        const payment = await payment_repository_1.paymentRepository.create(payload);
        // If payment is completed, auto-update invoice status to paid
        if (payload.status === 'completed' && invoiceId) {
            await db_1.prisma.invoice.update({
                where: { id: invoiceId },
                data: { status: 'paid' },
            }).catch(() => { });
        }
        return payment;
    },
    update: async (id, data, userId) => {
        const existing = await exports.paymentService.getById(id);
        const payload = { ...data, updatedBy: userId || null };
        if (payload.amount !== undefined)
            payload.amount = Number(payload.amount) || 0;
        if (payload.currencyId && !isUuid(payload.currencyId))
            delete payload.currencyId;
        if (payload.invoiceId && !isUuid(payload.invoiceId))
            delete payload.invoiceId;
        const updated = await payment_repository_1.paymentRepository.update(id, payload);
        if (payload.status === 'completed' && existing.invoiceId) {
            await db_1.prisma.invoice.update({
                where: { id: existing.invoiceId },
                data: { status: 'paid' },
            }).catch(() => { });
        }
        return updated;
    },
    delete: async (id, userId) => {
        await exports.paymentService.getById(id);
        return payment_repository_1.paymentRepository.delete(id, userId);
    },
};
