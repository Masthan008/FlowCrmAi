import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export class QuoteRepository {
  async getNextQuoteNumber(): Promise<string> {
    const lastQuote = await prisma.quote.findFirst({
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

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.QuoteWhereInput;
    orderBy?: Prisma.QuoteOrderByWithRelationInput;
  }) {
    return prisma.quote.findMany({
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

  async count(where?: Prisma.QuoteWhereInput) {
    return prisma.quote.count({ where });
  }

  async findById(id: string) {
    return prisma.quote.findUnique({
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

  async create(data: {
    customerId: string;
    dealId?: string | null;
    number: string;
    status?: string;
    validUntil: Date;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    createdBy?: string | null;
    items: { productId: string; quantity: number; unitPrice: number; subtotal: number }[];
  }) {
    return prisma.quote.create({
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

  async update(
    id: string,
    data: {
      status?: string;
      validUntil?: Date;
      subtotal?: number;
      tax?: number;
      discount?: number;
      total?: number;
      updatedBy?: string | null;
      items?: { productId: string; quantity: number; unitPrice: number; subtotal: number }[];
    }
  ) {
    // If updating items, delete old ones and create new ones within transaction
    return prisma.$transaction(async (tx) => {
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

  async softDelete(id: string, userId?: string) {
    return prisma.quote.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId || null,
      },
    });
  }
}

export const quoteRepository = new QuoteRepository();
export default quoteRepository;
