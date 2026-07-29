"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.knowledgeService = void 0;
const knowledge_repository_1 = require("../repository/knowledge.repository");
const db_1 = require("../../database/db");
exports.knowledgeService = {
    getArticles: async (params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (params.search) {
            where.OR = [
                { title: { contains: params.search, mode: 'insensitive' } },
                { content: { contains: params.search, mode: 'insensitive' } },
            ];
        }
        if (params.category) {
            where.categoryId = params.category;
        }
        if (params.status) {
            where.status = params.status;
        }
        if (params.tags) {
            where.tags = { hasSome: params.tags.split(',') };
        }
        const [items, total] = await Promise.all([
            knowledge_repository_1.knowledgeRepository.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
            }),
            knowledge_repository_1.knowledgeRepository.count(where),
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
    getArticleById: async (id) => {
        const article = await knowledge_repository_1.knowledgeRepository.findById(id);
        if (!article || article.deletedAt) {
            throw Object.assign(new Error('Article not found'), { statusCode: 404 });
        }
        return article;
    },
    createArticle: async (data, userId) => {
        if (data.categoryId) {
            const category = await db_1.prisma.knowledgeCategory.findUnique({ where: { id: data.categoryId } });
            if (!category) {
                throw Object.assign(new Error('Category not found'), { statusCode: 400 });
            }
        }
        const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
        return knowledge_repository_1.knowledgeRepository.create({
            title: data.title,
            content: data.content,
            slug,
            categoryId: data.categoryId,
            status: data.status || 'Draft',
            tags: data.tags || [],
            createdBy: userId || null,
        });
    },
    updateArticle: async (id, data, userId) => {
        const existing = await knowledge_repository_1.knowledgeRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Article not found'), { statusCode: 404 });
        }
        return knowledge_repository_1.knowledgeRepository.update(id, { ...data, updatedBy: userId || null });
    },
    deleteArticle: async (id, userId) => {
        const existing = await knowledge_repository_1.knowledgeRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Article not found'), { statusCode: 404 });
        }
        return knowledge_repository_1.knowledgeRepository.softDelete(id, userId);
    },
    updateArticleStatus: async (id, status, userId) => {
        const existing = await knowledge_repository_1.knowledgeRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Article not found'), { statusCode: 404 });
        }
        return knowledge_repository_1.knowledgeRepository.update(id, { status, updatedBy: userId || null });
    },
    voteArticle: async (id, helpful, userId) => {
        const existing = await knowledge_repository_1.knowledgeRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Article not found'), { statusCode: 404 });
        }
        return knowledge_repository_1.knowledgeRepository.findById(id);
    },
    getCategories: async () => {
        return db_1.prisma.knowledgeCategory.findMany({
            where: { deletedAt: null },
            orderBy: { name: 'asc' },
        });
    },
    createCategory: async (data, userId) => {
        const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
        return db_1.prisma.knowledgeCategory.create({
            data: {
                name: data.name,
                slug,
                description: data.description,
                createdBy: userId || null,
            },
        });
    },
    updateCategory: async (id, data, userId) => {
        const existing = await db_1.prisma.knowledgeCategory.findUnique({ where: { id } });
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Category not found'), { statusCode: 404 });
        }
        return db_1.prisma.knowledgeCategory.update({
            where: { id },
            data: { ...data, updatedBy: userId || null },
        });
    },
    deleteCategory: async (id, userId) => {
        const existing = await db_1.prisma.knowledgeCategory.findUnique({ where: { id } });
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Category not found'), { statusCode: 404 });
        }
        return db_1.prisma.knowledgeCategory.update({
            where: { id },
            data: { deletedAt: new Date(), deletedBy: userId || null },
        });
    },
};
exports.default = exports.knowledgeService;
