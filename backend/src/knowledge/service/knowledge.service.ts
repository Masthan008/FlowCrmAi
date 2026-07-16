import { knowledgeRepository } from '../repository/knowledge.repository';
import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export const knowledgeService = {
  getArticles: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    tags?: string;
  }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.KnowledgeArticleWhereInput = {
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
      knowledgeRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      knowledgeRepository.count(where),
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

  getArticleById: async (id: string) => {
    const article = await knowledgeRepository.findById(id);
    if (!article || article.deletedAt) {
      throw Object.assign(new Error('Article not found'), { statusCode: 404 });
    }
    return article;
  },

  createArticle: async (
    data: {
      title: string;
      content: string;
      categoryId?: string;
      status?: string;
      tags?: string[];
    },
    userId?: string
  ) => {
    if (data.categoryId) {
      const category = await prisma.knowledgeCategory.findUnique({ where: { id: data.categoryId } });
      if (!category) {
        throw Object.assign(new Error('Category not found'), { statusCode: 400 });
      }
    }
    return knowledgeRepository.create({
      ...data,
      createdBy: userId || null,
    });
  },

  updateArticle: async (
    id: string,
    data: Partial<{
      title: string;
      content: string;
      categoryId: string | null;
      status: string;
      tags: string[];
    }>,
    userId?: string
  ) => {
    const existing = await knowledgeRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Article not found'), { statusCode: 404 });
    }
    return knowledgeRepository.update(id, { ...data, updatedBy: userId || null });
  },

  deleteArticle: async (id: string, userId?: string) => {
    const existing = await knowledgeRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Article not found'), { statusCode: 404 });
    }
    return knowledgeRepository.softDelete(id, userId);
  },

  updateArticleStatus: async (id: string, status: string, userId?: string) => {
    const existing = await knowledgeRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Article not found'), { statusCode: 404 });
    }
    return knowledgeRepository.update(id, { status, updatedBy: userId || null });
  },

  voteArticle: async (id: string, helpful: boolean, userId?: string) => {
    const existing = await knowledgeRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Article not found'), { statusCode: 404 });
    }

    if (helpful) {
      await knowledgeRepository.update(id, { helpfulCount: (existing.helpfulCount || 0) + 1 });
    } else {
      await knowledgeRepository.update(id, { notHelpfulCount: (existing.notHelpfulCount || 0) + 1 });
    }

    return knowledgeRepository.findById(id);
  },

  getCategories: async () => {
    return prisma.knowledgeCategory.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  },

  createCategory: async (
    data: { name: string; description?: string },
    userId?: string
  ) => {
    return prisma.knowledgeCategory.create({
      data: {
        name: data.name,
        description: data.description,
        createdBy: userId || null,
      },
    });
  },

  updateCategory: async (
    id: string,
    data: { name?: string; description?: string | null },
    userId?: string
  ) => {
    const existing = await prisma.knowledgeCategory.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Category not found'), { statusCode: 404 });
    }
    return prisma.knowledgeCategory.update({
      where: { id },
      data: { ...data, updatedBy: userId || null },
    });
  },

  deleteCategory: async (id: string, userId?: string) => {
    const existing = await prisma.knowledgeCategory.findUnique({ where: { id } });
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Category not found'), { statusCode: 404 });
    }
    return prisma.knowledgeCategory.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: userId || null },
    });
  },
};

export default knowledgeService;
