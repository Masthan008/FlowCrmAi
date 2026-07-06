import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export class ProductRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ProductWhereInput;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }) {
    return prisma.product.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
      include: {
        category: true,
      },
    });
  }

  async count(where?: Prisma.ProductWhereInput) {
    return prisma.product.count({ where });
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async findBySku(sku: string) {
    return prisma.product.findUnique({
      where: { sku },
      include: {
        category: true,
      },
    });
  }

  async create(data: Prisma.ProductUncheckedCreateInput) {
    return prisma.product.create({
      data,
      include: {
        category: true,
      },
    });
  }

  async update(id: string, data: Prisma.ProductUncheckedUpdateInput) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async softDelete(id: string, userId?: string) {
    return prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId || null,
        isActive: false,
      },
    });
  }

  // --- Category Repositories ---
  async findCategories(where?: Prisma.ProductCategoryWhereInput) {
    return prisma.productCategory.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(data: Prisma.ProductCategoryCreateInput) {
    return prisma.productCategory.create({
      data,
    });
  }

  async findCategoryById(id: string) {
    return prisma.productCategory.findUnique({
      where: { id },
    });
  }
}

export const productRepository = new ProductRepository();
export default productRepository;
