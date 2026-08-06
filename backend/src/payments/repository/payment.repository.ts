import { prisma } from '../../database/db';

export const paymentRepository = {
  findMany: async (params: { page?: number; limit?: number; search?: string; status?: string; invoiceId?: string }) => {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      ...(params.status && { status: params.status }),
      ...(params.invoiceId && { invoiceId: params.invoiceId }),
      ...(params.search && {
        OR: [
          { method: { contains: params.search, mode: 'insensitive' } },
          { transactionId: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, totalItems] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          invoice: {
            select: {
              id: true,
              number: true,
              total: true,
              customer: { select: { id: true, name: true } },
            },
          },
          currency: { select: { id: true, code: true, symbol: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.count({ where }),
    ]);

    return {
      items,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    };
  },

  findById: async (id: string) => {
    return prisma.payment.findFirst({
      where: { id, deletedAt: null },
      include: {
        invoice: {
          include: { customer: true, items: true },
        },
        currency: true,
      },
    });
  },

  create: async (data: any) => {
    return prisma.payment.create({
      data,
      include: {
        invoice: { select: { id: true, number: true } },
        currency: { select: { id: true, code: true, symbol: true } },
      },
    });
  },

  update: async (id: string, data: any) => {
    return prisma.payment.update({
      where: { id },
      data,
      include: {
        invoice: { select: { id: true, number: true } },
        currency: { select: { id: true, code: true, symbol: true } },
      },
    });
  },

  delete: async (id: string, deletedBy?: string) => {
    return prisma.payment.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  },
};
