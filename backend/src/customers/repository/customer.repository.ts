import { prisma } from '../../database/db';

export const customerRepository = {
  findMany: async (params: { page?: number; limit?: number; search?: string; type?: string; status?: string }) => {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      ...(params.type && { type: params.type }),
      ...(params.status && { status: params.status }),
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { email: { contains: params.search, mode: 'insensitive' } },
          { phone: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, totalItems] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        include: {
          company: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
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
    return prisma.customer.findFirst({
      where: { id, deletedAt: null },
      include: {
        company: true,
        contacts: { where: { deletedAt: null } },
        leads: { where: { deletedAt: null } },
        deals: { where: { deletedAt: null } },
        quotes: { where: { deletedAt: null } },
        invoices: { where: { deletedAt: null } },
        tickets: { where: { deletedAt: null } },
      },
    });
  },

  create: async (data: any) => {
    return prisma.customer.create({
      data,
      include: {
        company: { select: { id: true, name: true } },
      },
    });
  },

  update: async (id: string, data: any) => {
    return prisma.customer.update({
      where: { id },
      data,
      include: {
        company: { select: { id: true, name: true } },
      },
    });
  },

  delete: async (id: string, deletedBy?: string) => {
    return prisma.customer.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  },
};
