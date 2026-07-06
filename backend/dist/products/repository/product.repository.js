"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRepository = exports.ProductRepository = void 0;
const db_1 = require("../../database/db");
class ProductRepository {
    async findMany(params) {
        return db_1.prisma.product.findMany({
            skip: params.skip,
            take: params.take,
            where: params.where,
            orderBy: params.orderBy,
            include: {
                category: true,
            },
        });
    }
    async count(where) {
        return db_1.prisma.product.count({ where });
    }
    async findById(id) {
        return db_1.prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
            },
        });
    }
    async findBySku(sku) {
        return db_1.prisma.product.findUnique({
            where: { sku },
            include: {
                category: true,
            },
        });
    }
    async create(data) {
        return db_1.prisma.product.create({
            data,
            include: {
                category: true,
            },
        });
    }
    async update(id, data) {
        return db_1.prisma.product.update({
            where: { id },
            data,
            include: {
                category: true,
            },
        });
    }
    async softDelete(id, userId) {
        return db_1.prisma.product.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                deletedBy: userId || null,
                isActive: false,
            },
        });
    }
    // --- Category Repositories ---
    async findCategories(where) {
        return db_1.prisma.productCategory.findMany({
            where,
            orderBy: { name: 'asc' },
        });
    }
    async createCategory(data) {
        return db_1.prisma.productCategory.create({
            data,
        });
    }
    async findCategoryById(id) {
        return db_1.prisma.productCategory.findUnique({
            where: { id },
        });
    }
}
exports.ProductRepository = ProductRepository;
exports.productRepository = new ProductRepository();
exports.default = exports.productRepository;
