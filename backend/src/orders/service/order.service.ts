import { orderRepository } from '../repository/order.repository';
import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export const orderService = {
  getOrders: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    customerId?: string;
  }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      deletedAt: null,
    };

    if (params.search) {
      where.orderNumber = { contains: params.search, mode: 'insensitive' };
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    const [items, total] = await Promise.all([
      orderRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      orderRepository.count(where),
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

  getOrderById: async (id: string) => {
    const order = await orderRepository.findById(id);
    if (!order || order.deletedAt) {
      throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    }
    return order;
  },

  createOrder: async (
    data: {
      orderNumber?: string;
      customerId?: string;
      status?: string;
      total?: number;
      items?: Array<{ productId: string; quantity: number; unitPrice: number }>;
    },
    userId?: string
  ) => {
    let customerId = data.customerId;
    if (customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (!customer) {
        throw Object.assign(new Error('Customer not found'), { statusCode: 400 });
      }
    } else {
      const fallback = await prisma.customer.findFirst({
        where: { deletedAt: null },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      });
      if (fallback) {
        customerId = fallback.id;
      } else {
        const walkIn = await prisma.customer.create({
          data: { name: 'Walk-in Customer', createdBy: userId || null },
          select: { id: true },
        });
        customerId = walkIn.id;
      }
    }

    return orderRepository.createWithItems({ ...data, customerId }, userId);
  },

  updateOrder: async (
    id: string,
    data: Partial<{
      status: string;
      total: number;
      items: Array<{ productId: string; quantity: number; unitPrice: number }>;
    }>,
    userId?: string
  ) => {
    const existing = await orderRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    }
    const { items, ...orderFields } = data;
    return orderRepository.update(id, { ...orderFields, updatedBy: userId || null });
  },

  deleteOrder: async (id: string, userId?: string) => {
    const existing = await orderRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    }
    return orderRepository.softDelete(id, userId);
  },

  updateOrderStatus: async (id: string, status: string, userId?: string) => {
    const existing = await orderRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    }
    return orderRepository.update(id, { status, updatedBy: userId || null });
  },
};

export default orderService;
