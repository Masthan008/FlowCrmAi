"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceService = void 0;
const invoice_repository_1 = require("../repository/invoice.repository");
const db_1 = require("../../database/db");
exports.invoiceService = {
    getInvoices: async (params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (params.search) {
            where.number = { contains: params.search, mode: 'insensitive' };
        }
        if (params.status) {
            where.status = params.status;
        }
        if (params.customerId) {
            where.customerId = params.customerId;
        }
        if (params.dealId) {
            where.dealId = params.dealId;
        }
        const [items, total] = await Promise.all([
            invoice_repository_1.invoiceRepository.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
            }),
            invoice_repository_1.invoiceRepository.count(where),
        ]);
        return {
            items,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        };
    },
    getInvoiceById: async (id) => {
        const invoice = await invoice_repository_1.invoiceRepository.findById(id);
        if (!invoice || invoice.deletedAt) {
            throw Object.assign(new Error('Invoice not found'), { statusCode: 404 });
        }
        return invoice;
    },
    createInvoice: async (data, userId) => {
        // Verify customer
        const customer = await db_1.prisma.customer.findUnique({ where: { id: data.customerId } });
        if (!customer) {
            throw Object.assign(new Error('Customer not found'), { statusCode: 400 });
        }
        if (data.dealId) {
            const deal = await db_1.prisma.deal.findUnique({ where: { id: data.dealId } });
            if (!deal) {
                throw Object.assign(new Error('Deal not found'), { statusCode: 400 });
            }
        }
        let subtotal = 0;
        const processedItems = [];
        for (const item of data.items) {
            const product = await db_1.prisma.product.findUnique({ where: { id: item.productId } });
            if (!product || !product.isActive || product.deletedAt) {
                throw Object.assign(new Error(`Product with ID "${item.productId}" is unavailable`), { statusCode: 400 });
            }
            const itemSubtotal = item.quantity * item.unitPrice;
            subtotal += itemSubtotal;
            processedItems.push({
                ...item,
                subtotal: itemSubtotal,
            });
        }
        const taxRate = data.taxRate || 0;
        const tax = subtotal * (taxRate / 100);
        const discount = data.discount || 0;
        const total = subtotal + tax - discount;
        const number = await invoice_repository_1.invoiceRepository.getNextInvoiceNumber();
        return invoice_repository_1.invoiceRepository.create({
            customerId: data.customerId,
            dealId: data.dealId,
            number,
            dueDate: new Date(data.dueDate),
            subtotal,
            tax,
            discount,
            total,
            createdBy: userId || null,
            items: processedItems,
        });
    },
    updateInvoice: async (id, data, userId) => {
        const existing = await invoice_repository_1.invoiceRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Invoice not found'), { statusCode: 404 });
        }
        let subtotal = existing.subtotal;
        let processedItems = undefined;
        if (data.items) {
            subtotal = 0;
            processedItems = [];
            for (const item of data.items) {
                const product = await db_1.prisma.product.findUnique({ where: { id: item.productId } });
                if (!product || !product.isActive || product.deletedAt) {
                    throw Object.assign(new Error(`Product with ID "${item.productId}" is unavailable`), { statusCode: 400 });
                }
                const itemSubtotal = item.quantity * item.unitPrice;
                subtotal += itemSubtotal;
                processedItems.push({
                    ...item,
                    subtotal: itemSubtotal,
                });
            }
        }
        const discount = data.discount !== undefined ? data.discount : existing.discount;
        const taxRate = data.taxRate !== undefined ? data.taxRate : undefined;
        let tax = existing.tax;
        if (taxRate !== undefined) {
            tax = subtotal * (taxRate / 100);
        }
        else if (data.items) {
            const prevTaxRate = existing.subtotal > 0 ? (existing.tax / existing.subtotal) * 100 : 0;
            tax = subtotal * (prevTaxRate / 100);
        }
        const total = subtotal + tax - discount;
        return invoice_repository_1.invoiceRepository.update(id, {
            status: data.status,
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
            subtotal,
            tax,
            discount,
            total,
            items: processedItems,
            updatedBy: userId || null,
        });
    },
    deleteInvoice: async (id, userId) => {
        const existing = await invoice_repository_1.invoiceRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Invoice not found'), { statusCode: 404 });
        }
        return invoice_repository_1.invoiceRepository.softDelete(id, userId);
    },
    recordPayment: async (invoiceId, data, userId) => {
        const invoice = await invoice_repository_1.invoiceRepository.findById(invoiceId);
        if (!invoice || invoice.deletedAt) {
            throw Object.assign(new Error('Invoice not found'), { statusCode: 404 });
        }
        // Record payment
        const payment = await invoice_repository_1.invoiceRepository.createPayment({
            invoiceId,
            amount: data.amount,
            status: 'completed',
            paymentMethod: data.paymentMethod,
            transactionId: data.transactionId,
            createdBy: userId || null,
        });
        // Recalculate invoice status based on total completed payments
        const payments = await invoice_repository_1.invoiceRepository.getPayments(invoiceId);
        const totalPaid = payments
            .filter((p) => p.status === 'completed')
            .reduce((sum, p) => sum + p.amount, 0);
        let newStatus = 'unpaid';
        if (totalPaid >= invoice.total) {
            newStatus = 'paid';
        }
        else if (totalPaid > 0) {
            newStatus = 'partially_paid';
        }
        await invoice_repository_1.invoiceRepository.update(invoiceId, {
            status: newStatus,
        });
        return payment;
    },
    getInvoicePayments: async (invoiceId) => {
        const invoice = await invoice_repository_1.invoiceRepository.findById(invoiceId);
        if (!invoice || invoice.deletedAt) {
            throw Object.assign(new Error('Invoice not found'), { statusCode: 404 });
        }
        return invoice_repository_1.invoiceRepository.getPayments(invoiceId);
    },
};
exports.default = exports.invoiceService;
