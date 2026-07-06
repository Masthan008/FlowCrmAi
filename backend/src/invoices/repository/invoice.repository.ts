import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export class InvoiceRepository {
  async getNextInvoiceNumber(): Promise<string> {
    const lastInvoice = await prisma.invoice.findFirst({
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

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.InvoiceWhereInput;
    orderBy?: Prisma.InvoiceOrderByWithRelationInput;
  }) {
    return prisma.invoice.findMany({
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

  async count(where?: Prisma.InvoiceWhereInput) {
    return prisma.invoice.count({ where });
  }

  async findById(id: string) {
    return prisma.invoice.findUnique({
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

  async create(data: {
    customerId: string;
    dealId?: string | null;
    number: string;
    status?: string;
    dueDate: Date;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    createdBy?: string | null;
    items: { productId: string; quantity: number; unitPrice: number; subtotal: number }[];
  }) {
    return prisma.invoice.create({
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

  async update(
    id: string,
    data: {
      status?: string;
      dueDate?: Date;
      subtotal?: number;
      tax?: number;
      discount?: number;
      total?: number;
      updatedBy?: string | null;
      items?: { productId: string; quantity: number; unitPrice: number; subtotal: number }[];
    }
  ) {
    return prisma.$transaction(async (tx) => {
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

  async softDelete(id: string, userId?: string) {
    return prisma.invoice.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId || null,
      },
    });
  }

  // --- Payments Repositories ---
  async createPayment(data: {
    invoiceId: string;
    amount: number;
    status: string;
    paymentMethod: string;
    transactionId?: string | null;
    createdBy?: string | null;
  }) {
    // Find or create default USD currency
    let currency = await prisma.currency.findUnique({ where: { code: 'USD' } });
    if (!currency) {
      currency = await prisma.currency.create({
        data: {
          code: 'USD',
          name: 'US Dollar',
          symbol: '$',
        },
      });
    }

    return prisma.payment.create({
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

  async getPayments(invoiceId: string) {
    return prisma.payment.findMany({
      where: { invoiceId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const invoiceRepository = new InvoiceRepository();
export default invoiceRepository;
