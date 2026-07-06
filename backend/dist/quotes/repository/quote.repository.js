"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quoteRepository = exports.QuoteRepository = void 0;
const db_1 = require("../../database/db");
class QuoteRepository {
    async getNextQuoteNumber() {
        const lastQuote = await db_1.prisma.quote.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { number: true },
        });
        if (!lastQuote || !lastQuote.number) {
            return 'QT-2026-001';
        }
        const match = lastQuote.number.match(/QT-2026-(\d+)/);
        if (!match) {
            return 'QT-2026-001';
        }
        const currentNum = parseInt(match[1], 10);
        const nextNum = currentNum + 1;
        return `QT-2026-${String(nextNum).padStart(3, '0')}`;
    }
    async findMany(params) {
        return db_1.prisma.quote.findMany({
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
            },
        });
    }
    async count(where) {
        return db_1.prisma.quote.count({ where });
    }
    async findById(id) {
        return db_1.prisma.quote.findUnique({
            where: { id },
            include: {
                customer: true,
                deal: true,
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
    }
    async create(data) {
        return db_1.prisma.quote.create({
            data: {
                customerId: data.customerId,
                dealId: data.dealId || null,
                number: data.number,
                status: data.status || 'draft',
                validUntil: data.validUntil,
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
            },
        });
    }
    async update(id, data) {
        // If updating items, delete old ones and create new ones within transaction
        return db_1.prisma.$transaction(async (tx) => {
            if (data.items) {
                await tx.quoteItem.deleteMany({ where: { quoteId: id } });
            }
            return tx.quote.update({
                where: { id },
                data: {
                    status: data.status,
                    validUntil: data.validUntil,
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
                },
            });
        });
    }
    async softDelete(id, userId) {
        return db_1.prisma.quote.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy: userId || null,
            },
        });
    }
}
exports.QuoteRepository = QuoteRepository;
exports.quoteRepository = new QuoteRepository();
exports.default = exports.quoteRepository;
