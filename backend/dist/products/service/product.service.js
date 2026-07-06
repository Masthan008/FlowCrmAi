"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = void 0;
const product_repository_1 = require("../repository/product.repository");
exports.productService = {
    getProducts: async (params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
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
            product_repository_1.productRepository.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
            }),
            product_repository_1.productRepository.count(where),
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
    getProductById: async (id) => {
        const product = await product_repository_1.productRepository.findById(id);
        if (!product || product.deletedAt) {
            throw Object.assign(new Error('Product not found'), { statusCode: 404 });
        }
        return product;
    },
    createProduct: async (data, userId) => {
        // Validate category
        const categoryExists = await product_repository_1.productRepository.findCategoryById(data.categoryId);
        if (!categoryExists) {
            throw Object.assign(new Error('Product Category not found'), { statusCode: 400 });
        }
        // Check SKU unique
        const skuExists = await product_repository_1.productRepository.findBySku(data.sku);
        if (skuExists && !skuExists.deletedAt) {
            throw Object.assign(new Error(`Product with SKU "${data.sku}" already exists`), { statusCode: 400 });
        }
        return product_repository_1.productRepository.create({
            ...data,
            createdBy: userId || null,
        });
    },
    updateProduct: async (id, data, userId) => {
        const existing = await product_repository_1.productRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Product not found'), { statusCode: 404 });
        }
        if (data.categoryId) {
            const categoryExists = await product_repository_1.productRepository.findCategoryById(data.categoryId);
            if (!categoryExists) {
                throw Object.assign(new Error('Product Category not found'), { statusCode: 400 });
            }
        }
        if (data.sku && data.sku !== existing.sku) {
            const skuExists = await product_repository_1.productRepository.findBySku(data.sku);
            if (skuExists && !skuExists.deletedAt) {
                throw Object.assign(new Error(`Product with SKU "${data.sku}" already exists`), { statusCode: 400 });
            }
        }
        return product_repository_1.productRepository.update(id, {
            ...data,
            updatedBy: userId || null,
        });
    },
    deleteProduct: async (id, userId) => {
        const existing = await product_repository_1.productRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Product not found'), { statusCode: 404 });
        }
        return product_repository_1.productRepository.softDelete(id, userId);
    },
    getCategories: async () => {
        return product_repository_1.productRepository.findCategories();
    },
    createCategory: async (data, userId) => {
        return product_repository_1.productRepository.createCategory({
            ...data,
            createdBy: userId || null,
        });
    },
};
exports.default = exports.productService;
