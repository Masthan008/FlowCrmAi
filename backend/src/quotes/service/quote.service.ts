import { quoteRepository } from '../repository/quote.repository';
import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export const quoteService = {
  getQuotes: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerId?: string;
    dealId?: string;
  }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.QuoteWhereInput = {
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
      quoteRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      quoteRepository.count(where),
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

  getQuoteById: async (id: string) => {
    const quote = await quoteRepository.findById(id);
    if (!quote || quote.deletedAt) {
      throw Object.assign(new Error('Quote not found'), { statusCode: 404 });
    }
    return quote;
  },

  createQuote: async (
    data: {
      customerId: string;
      dealId?: string | null;
      validUntil: Date;
      taxRate?: number; // e.g. 15 for 15%
      discount?: number;
      items: { productId: string; quantity: number; unitPrice: number }[];
    },
    userId?: string
  ) => {
    // Verify customer
    const customer = await prisma.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) {
      throw Object.assign(new Error('Customer not found'), { statusCode: 400 });
    }

    if (data.dealId) {
      const deal = await prisma.deal.findUnique({ where: { id: data.dealId } });
      if (!deal) {
        throw Object.assign(new Error('Deal not found'), { statusCode: 400 });
      }
    }

    // Check items and calculate subtotal
    let subtotal = 0;
    const processedItems = [];

    for (const item of data.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
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

    const number = await quoteRepository.getNextQuoteNumber();

    return quoteRepository.create({
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

  updateQuote: async (
    id: string,
    data: {
      status?: string;
      validUntil?: Date;
      taxRate?: number;
      discount?: number;
      items?: { productId: string; quantity: number; unitPrice: number }[];
    },
    userId?: string
  ) => {
    const existing = await quoteRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Quote not found'), { statusCode: 404 });
    }

    let subtotal = existing.subtotal;
    let processedItems = undefined;

    if (data.items) {
      subtotal = 0;
      processedItems = [];
      for (const item of data.items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
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
    } else if (data.items) {
      // If items changed, calculate tax with previous tax rate ratio
      const prevTaxRate = existing.subtotal > 0 ? (existing.tax / existing.subtotal) * 100 : 0;
      tax = subtotal * (prevTaxRate / 100);
    }

    const total = subtotal + tax - discount;

    return quoteRepository.update(id, {
      status: data.status,
      validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
      subtotal,
      tax,
      discount,
      total,
      items: processedItems,
      updatedBy: userId || null,
    });
  },

  deleteQuote: async (id: string, userId?: string) => {
    const existing = await quoteRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Quote not found'), { statusCode: 404 });
    }
    return quoteRepository.softDelete(id, userId);
  },
};

export default quoteService;
