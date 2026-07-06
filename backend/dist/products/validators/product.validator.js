"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategorySchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        categoryId: zod_1.z.string().uuid('Invalid category ID'),
        name: zod_1.z.string().min(1, 'Product name is required').max(200),
        sku: zod_1.z.string().min(1, 'Product SKU is required').max(100),
        price: zod_1.z.number().min(0, 'Price must be positive'),
        isActive: zod_1.z.boolean().optional(),
    }),
});
exports.updateProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        categoryId: zod_1.z.string().uuid('Invalid category ID').optional(),
        name: zod_1.z.string().min(1, 'Product name cannot be empty').max(200).optional(),
        sku: zod_1.z.string().min(1, 'Product SKU cannot be empty').max(100).optional(),
        price: zod_1.z.number().min(0, 'Price must be positive').optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
});
exports.createCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Category name is required').max(100),
        description: zod_1.z.string().max(500).optional(),
    }),
});
