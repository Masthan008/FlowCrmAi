import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export class OrderRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.OrderWhereInput;
    orderBy?: Prisma.OrderOrderByWithRelationInput;
  }) {
    return prisma.order.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        items: true,
      },
    });
  }

  async count(where?: Prisma.OrderWhereInput) {
    return prisma.order.count({ where });
  }

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        items: true,
      },
    });
  }

  async create(data: Prisma.OrderUncheckedCreateInput) {
    return prisma.order.create({
      data,
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        items: true,
      },
    });
  }

  async createWithItems(
    data: {
      orderNumber?: string;
      customerId: string;
      status?: string;
      total?: number;
      items?: Array<{ productId: string; quantity: number; unitPrice: number }>;
    },
    userId?: string
  ) {
    const { items, ...orderData } = data;

    return prisma.order.create({
      data: {
        ...orderData,
        createdBy: userId || null,
        items: items && items.length > 0
          ? {
              create: items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                createdBy: userId || null,
              })),
            }
          : undefined,
      },
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        items: true,
      },
    });
  }

  async update(id: string, data: Prisma.OrderUncheckedUpdateInput) {
    return prisma.order.update({
      where: { id },
      data,
      include: {
        customer: {
          select: { id: true, name: true, email: true },
        },
        items: true,
      },
    });
  }

  async softDelete(id: string, userId?: string) {
    return prisma.order.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId || null,
      },
    });
  }
}

export const orderRepository = new OrderRepository();
export default orderRepository;
