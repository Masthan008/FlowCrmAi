"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quoteService = void 0;
const quote_repository_1 = require("../repository/quote.repository");
const db_1 = require("../../database/db");
exports.quoteService = {
    getQuotes: async (params) => {
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
            quote_repository_1.quoteRepository.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
            }),
            quote_repository_1.quoteRepository.count(where),
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
    getQuoteById: async (id) => {
        const quote = await quote_repository_1.quoteRepository.findById(id);
        if (!quote || quote.deletedAt) {
            throw Object.assign(new Error('Quote not found'), { statusCode: 404 });
        }
        return quote;
    },
    createQuote: async (data, userId) => {
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
        // Check items and calculate subtotal
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
        const number = await quote_repository_1.quoteRepository.getNextQuoteNumber();
        return quote_repository_1.quoteRepository.create({
            customerId: data.customerId,
            dealId: data.dealId,
            number,
            validUntil: new Date(data.validUntil),
            subtotal,
            tax,
            discount,
            total,
            createdBy: userId || null,
            items: processedItems,
        });
    },
    updateQuote: async (id, data, userId) => {
        const existing = await quote_repository_1.quoteRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Quote not found'), { statusCode: 404 });
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
        // Recalculate billing
        const discount = data.discount !== undefined ? data.discount : existing.discount;
        const taxRate = data.taxRate !== undefined ? data.taxRate : undefined;
        let tax = existing.tax;
        if (taxRate !== undefined) {
            tax = subtotal * (taxRate / 100);
        }
        else if (data.items) {
            // If items changed, calculate tax with previous tax rate ratio
            const prevTaxRate = existing.subtotal > 0 ? (existing.tax / existing.subtotal) * 100 : 0;
            tax = subtotal * (prevTaxRate / 100);
        }
        const total = subtotal + tax - discount;
        const updatedQuote = await quote_repository_1.quoteRepository.update(id, {
            status: data.status,
            validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
            subtotal,
            tax,
            discount,
            total,
            items: processedItems,
            updatedBy: userId || null,
        });
        // Lead-to-Cash Automation: If quote status changed to approved, auto-create an Order
        if (data.status && (data.status.toLowerCase() === 'approved' || data.status.toLowerCase() === 'accepted')) {
            try {
                const existingOrder = await db_1.prisma.order.findFirst({
                    where: { quoteId: id, deletedAt: null },
                }).catch(() => null);
                if (!existingOrder) {
                    const orderNumber = `ORD-${Date.now().toString().substring(5)}`;
                    const quoteItems = existing.items || [];
                    await db_1.prisma.order.create({
                        data: {
                            orderNumber,
                            customerId: existing.customerId,
                            quoteId: id,
                            dealId: existing.dealId,
                            total: updatedQuote.total || existing.total || 0,
                            subtotal: updatedQuote.subtotal || existing.subtotal || 0,
                            tax: updatedQuote.tax || existing.tax || 0,
                            discount: updatedQuote.discount || existing.discount || 0,
                            status: 'confirmed',
                            createdBy: userId || null,
                        },
                    }).catch((err) => console.error('Auto order creation caught:', err?.message));
                }
            }
            catch (err) {
                console.error('Lead-to-Cash Quote Approval Order Trigger Error:', err);
            }
        }
        return updatedQuote;
    },
    deleteQuote: async (id, userId) => {
        const existing = await quote_repository_1.quoteRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Quote not found'), { statusCode: 404 });
        }
        return quote_repository_1.quoteRepository.softDelete(id, userId);
    },
};
exports.default = exports.quoteService;
