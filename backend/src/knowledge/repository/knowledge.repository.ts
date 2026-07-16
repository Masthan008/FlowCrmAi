import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export class KnowledgeRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.KnowledgeArticleWhereInput;
    orderBy?: Prisma.KnowledgeArticleOrderByWithRelationInput;
  }) {
    return prisma.knowledgeArticle.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async count(where?: Prisma.KnowledgeArticleWhereInput) {
    return prisma.knowledgeArticle.count({ where });
  }

  async findById(id: string) {
    return prisma.knowledgeArticle.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async create(data: Prisma.KnowledgeArticleUncheckedCreateInput) {
    return prisma.knowledgeArticle.create({
      data,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async update(id: string, data: Prisma.KnowledgeArticleUncheckedUpdateInput) {
    return prisma.knowledgeArticle.update({
      where: { id },
      data,
      include: {
        category: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async softDelete(id: string, userId?: string) {
    return prisma.knowledgeArticle.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId || null,
      },
    });
  }
}

export const knowledgeRepository = new KnowledgeRepository();
export default knowledgeRepository;
