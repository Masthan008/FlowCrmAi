import { prisma } from '../../database/db';

export const calendarRepository = {
  findMany: async (params: { page?: number; limit?: number; search?: string; organizerId?: string; customerId?: string; dealId?: string; from?: string; to?: string }) => {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      ...(params.organizerId && { organizerId: params.organizerId }),
      ...(params.customerId && { customerId: params.customerId }),
      ...(params.dealId && { dealId: params.dealId }),
      ...(params.search && {
        OR: [
          { title: { contains: params.search, mode: 'insensitive' } },
          { description: { contains: params.search, mode: 'insensitive' } },
          { location: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
      ...(params.from && { startTime: { gte: new Date(params.from) } }),
      ...(params.to && { endTime: { lte: new Date(params.to) } }),
    };

    const [items, totalItems] = await Promise.all([
      prisma.meeting.findMany({
        where,
        skip,
        take: limit,
        include: {
          organizer: { select: { id: true, firstName: true, lastName: true, email: true } },
          customer: { select: { id: true, name: true, email: true } },
          deal: { select: { id: true, name: true } },
        },
        orderBy: { startTime: 'asc' },
      }),
      prisma.meeting.count({ where }),
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
    return prisma.meeting.findFirst({
      where: { id, deletedAt: null },
      include: {
        organizer: true,
        customer: true,
        deal: true,
      },
    });
  },

  create: async (data: any) => {
    return prisma.meeting.create({
      data,
      include: {
        organizer: { select: { id: true, firstName: true, lastName: true, email: true } },
        customer: { select: { id: true, name: true } },
        deal: { select: { id: true, name: true } },
      },
    });
  },

  update: async (id: string, data: any) => {
    return prisma.meeting.update({
      where: { id },
      data,
      include: {
        organizer: { select: { id: true, firstName: true, lastName: true, email: true } },
        customer: { select: { id: true, name: true } },
        deal: { select: { id: true, name: true } },
      },
    });
  },

  delete: async (id: string, deletedBy?: string) => {
    return prisma.meeting.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  },
};
