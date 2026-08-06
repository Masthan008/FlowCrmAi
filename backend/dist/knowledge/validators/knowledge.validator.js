"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voteArticleSchema = exports.updateCategorySchema = exports.createCategorySchema = exports.updateArticleSchema = exports.createArticleSchema = void 0;
const zod_1 = require("zod");
exports.createArticleSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required').max(300),
        content: zod_1.z.string().min(1, 'Content is required'),
        categoryId: zod_1.z.string().uuid('Invalid category ID').optional().nullable(),
        status: zod_1.z.string().optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.updateArticleSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title cannot be empty').max(300).optional(),
        content: zod_1.z.string().min(1, 'Content cannot be empty').optional(),
        categoryId: zod_1.z.string().uuid('Invalid category ID').optional().nullable(),
        status: zod_1.z.string().optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.createCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Category name is required').max(200),
        description: zod_1.z.string().max(2000).optional().nullable(),
    }),
});
exports.updateCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Category name cannot be empty').max(200).optional(),
        description: zod_1.z.string().max(2000).optional().nullable(),
    }),
});
exports.voteArticleSchema = zod_1.z.object({
    body: zod_1.z.object({
        vote: zod_1.z.string().optional().nullable(),
        helpful: zod_1.z.boolean().optional().nullable(),
    }),
});
