"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoiceRepository = exports.InvoiceRepository = void 0;
const db_1 = require("../../database/db");
class InvoiceRepository {
    async getNextInvoiceNumber() {
        const lastInvoice = await db_1.prisma.invoice.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { number: true },
        });
        if (!lastInvoice || !lastInvoice.number) {
            return 'INV-2026-001';
        }
        const match = lastInvoice.number.match(/INV-2026-(\d+)/);
        if (!match) {
            return 'INV-2026-001';
        }
        const currentNum = parseInt(match[1], 10);
        const nextNum = currentNum + 1;
        return `INV-2026-${String(nextNum).padStart(3, '0')}`;
    }
    async findMany(params) {
        return db_1.prisma.invoice.findMany({
            skip: params.skip,
            take: params.take,
            where: params.where,
            orderBy: params.orderBy,
            include: {
                customer: true,
                deal: true,
                items: {
                    include: {
                        product: true,
                    },
                },
                payments: true,
            },
        });
    }
    async count(where) {
        return db_1.prisma.invoice.count({ where });
    }
    async findById(id) {
        return db_1.prisma.invoice.findUnique({
            where: { id },
            include: {
                customer: true,
                deal: true,
                items: {
                    include: {
                        product: true,
                    },
                },
                payments: true,
            },
        });
    }
    async create(data) {
        return db_1.prisma.invoice.create({
            data: {
                customerId: data.customerId,
                dealId: data.dealId || null,
                number: data.number,
                status: data.status || 'unpaid',
                dueDate: data.dueDate,
                subtotal: data.subtotal,
                tax: data.tax,
                discount: data.discount,
                total: data.total,
                createdBy: data.createdBy,
                items: {
                    create: data.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        subtotal: item.subtotal,
                    })),
                },
            },
            include: {
                customer: true,
                deal: true,
                items: {
                    include: {
                        product: true,
                    },
                },
                payments: true,
            },
        });
    }
    async update(id, data) {
        return db_1.prisma.$transaction(async (tx) => {
            if (data.items) {
                await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
            }
            return tx.invoice.update({
                where: { id },
                data: {
                    status: data.status,
                    dueDate: data.dueDate,
                    subtotal: data.subtotal,
                    tax: data.tax,
                    discount: data.discount,
                    total: data.total,
                    updatedBy: data.updatedBy,
                    items: data.items
                        ? {
                            create: data.items.map((item) => ({
                                productId: item.productId,
                                quantity: item.quantity,
                                unitPrice: item.unitPrice,
                                subtotal: item.subtotal,
                            })),
                        }
                        : undefined,
                },
                include: {
                    customer: true,
                    deal: true,
                    items: {
                        include: {
                            product: true,
                        },
                    },
                    payments: true,
                },
            });
        });
    }
    async softDelete(id, userId) {
        return db_1.prisma.invoice.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy: userId || null,
            },
        });
    }
    // --- Payments Repositories ---
    async createPayment(data) {
        // Find or create default USD currency
        let currency = await db_1.prisma.currency.findUnique({ where: { code: 'USD' } });
        if (!currency) {
            currency = await db_1.prisma.currency.create({
                data: {
                    code: 'USD',
                    name: 'US Dollar',
                    symbol: '$',
                },
            });
        }
        return db_1.prisma.payment.create({
            data: {
                invoiceId: data.invoiceId,
                amount: data.amount,
                status: data.status,
                method: data.paymentMethod,
                transactionId: data.transactionId || null,
                currencyId: currency.id,
                createdBy: data.createdBy,
            },
        });
    }
    async getPayments(invoiceId) {
        return db_1.prisma.payment.findMany({
            where: { invoiceId, deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
    }
}
exports.InvoiceRepository = InvoiceRepository;
exports.invoiceRepository = new InvoiceRepository();
exports.default = exports.invoiceRepository;
