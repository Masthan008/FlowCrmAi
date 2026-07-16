import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export class SurveyRepository {
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.SurveyWhereInput;
    orderBy?: Prisma.SurveyOrderByWithRelationInput;
  }) {
    return prisma.survey.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
      orderBy: params.orderBy,
      include: {
        template: {
          select: { id: true, name: true, subject: true },
        },
        _count: {
          select: { responses: true },
        },
      },
    });
  }

  async count(where?: Prisma.SurveyWhereInput) {
    return prisma.survey.count({ where });
  }

  async findById(id: string) {
    return prisma.survey.findUnique({
      where: { id },
      include: {
        template: {
          select: { id: true, name: true, subject: true },
        },
        _count: {
          select: { responses: true },
        },
      },
    });
  }

  async create(data: Prisma.SurveyUncheckedCreateInput) {
    return prisma.survey.create({
      data,
      include: {
        template: {
          select: { id: true, name: true, subject: true },
        },
      },
    });
  }

  async update(id: string, data: Prisma.SurveyUncheckedUpdateInput) {
    return prisma.survey.update({
      where: { id },
      data,
      include: {
        template: {
          select: { id: true, name: true, subject: true },
        },
      },
    });
  }

  async softDelete(id: string, userId?: string) {
    return prisma.survey.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: userId || null,
      },
    });
  }
}

export const surveyRepository = new SurveyRepository();
export default surveyRepository;
