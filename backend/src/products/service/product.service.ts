import { productRepository } from '../repository/product.repository';
import type { Prisma } from '@prisma/client';

export const productService = {
  getProducts: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    isActive?: boolean;
  }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      deletedAt: null,
    };

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { sku: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const [items, total] = await Promise.all([
      productRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      productRepository.count(where),
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

  getProductById: async (id: string) => {
    const product = await productRepository.findById(id);
    if (!product || product.deletedAt) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }
    return product;
  },

  createProduct: async (data: { categoryId: string; name: string; sku: string; price: number; isActive?: boolean }, userId?: string) => {
    // Validate category
    const categoryExists = await productRepository.findCategoryById(data.categoryId);
    if (!categoryExists) {
      throw Object.assign(new Error('Product Category not found'), { statusCode: 400 });
    }

    // Check SKU unique
    const skuExists = await productRepository.findBySku(data.sku);
    if (skuExists && !skuExists.deletedAt) {
      throw Object.assign(new Error(`Product with SKU "${data.sku}" already exists`), { statusCode: 400 });
    }

    return productRepository.create({
      ...data,
      createdBy: userId || null,
    });
  },

  updateProduct: async (id: string, data: Partial<{ categoryId: string; name: string; sku: string; price: number; isActive: boolean }>, userId?: string) => {
    const existing = await productRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }

    if (data.categoryId) {
      const categoryExists = await productRepository.findCategoryById(data.categoryId);
      if (!categoryExists) {
        throw Object.assign(new Error('Product Category not found'), { statusCode: 400 });
      }
    }

    if (data.sku && data.sku !== existing.sku) {
      const skuExists = await productRepository.findBySku(data.sku);
      if (skuExists && !skuExists.deletedAt) {
        throw Object.assign(new Error(`Product with SKU "${data.sku}" already exists`), { statusCode: 400 });
      }
    }

    return productRepository.update(id, {
      ...data,
      updatedBy: userId || null,
    });
  },

  deleteProduct: async (id: string, userId?: string) => {
    const existing = await productRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    }
    return productRepository.softDelete(id, userId);
  },

  getCategories: async () => {
    return productRepository.findCategories();
  },

  createCategory: async (data: { name: string; description?: string }, userId?: string) => {
    return productRepository.createCategory({
      ...data,
      createdBy: userId || null,
    });
  },
};

export default productService;
