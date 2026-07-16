import { surveyRepository } from '../repository/survey.repository';
import { prisma } from '../../database/db';
import type { Prisma } from '@prisma/client';

export const surveyService = {
  getSurveys: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SurveyWhereInput = {
      deletedAt: null,
    };

    if (params.search) {
      where.title = { contains: params.search, mode: 'insensitive' };
    }

    if (params.status) {
      where.status = params.status;
    }

    const [items, total] = await Promise.all([
      surveyRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      surveyRepository.count(where),
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

  getSurveyById: async (id: string) => {
    const survey = await surveyRepository.findById(id);
    if (!survey || survey.deletedAt) {
      throw Object.assign(new Error('Survey not found'), { statusCode: 404 });
    }
    return survey;
  },

  createSurvey: async (
    data: {
      title: string;
      description?: string | null;
      type?: string;
      questions?: any;
      targetAudience?: any;
      sendMethod?: string;
      templateId?: string | null;
    },
    userId?: string
  ) => {
    return surveyRepository.create({
      ...data,
      questions: data.questions || [],
      createdBy: userId || null,
    });
  },

  updateSurvey: async (
    id: string,
    data: Partial<{
      title: string;
      description: string | null;
      type: string;
      questions: any;
      targetAudience: any;
      sendMethod: string;
      templateId: string | null;
    }>,
    userId?: string
  ) => {
    const existing = await surveyRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Survey not found'), { statusCode: 404 });
    }
    return surveyRepository.update(id, { ...data, updatedBy: userId || null });
  },

  deleteSurvey: async (id: string, userId?: string) => {
    const existing = await surveyRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Survey not found'), { statusCode: 404 });
    }
    return surveyRepository.softDelete(id, userId);
  },

  activateSurvey: async (id: string, userId?: string) => {
    const existing = await surveyRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Survey not found'), { statusCode: 404 });
    }
    return surveyRepository.update(id, { status: 'Active', updatedBy: userId || null });
  },

  closeSurvey: async (id: string, userId?: string) => {
    const existing = await surveyRepository.findById(id);
    if (!existing || existing.deletedAt) {
      throw Object.assign(new Error('Survey not found'), { statusCode: 404 });
    }
    return surveyRepository.update(id, { status: 'Closed', updatedBy: userId || null });
  },

  getResponses: async (surveyId: string, params: { page?: number; limit?: number }) => {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SurveyResponseWhereInput = { surveyId };

    const [items, total] = await Promise.all([
      prisma.surveyResponse.findMany({
        skip,
        take: limit,
        where,
        orderBy: { submittedAt: 'desc' },
        include: {
          contact: { select: { id: true, fullName: true, email: true } },
          customer: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.surveyResponse.count({ where }),
    ]);

    return {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  },

  getAnalytics: async (surveyId: string) => {
    const survey = await surveyRepository.findById(surveyId);
    if (!survey || survey.deletedAt) {
      throw Object.assign(new Error('Survey not found'), { statusCode: 404 });
    }

    const [responses, aggregate] = await Promise.all([
      prisma.surveyResponse.findMany({
        where: { surveyId },
        select: { score: true, comment: true, submittedAt: true },
      }),
      prisma.surveyResponse.aggregate({
        where: { surveyId },
        _avg: { score: true },
        _count: true,
      }),
    ]);

    const totalResponses = aggregate._count;
    const avgScore = aggregate._avg.score || 0;

    let responseRate = 0;
    if (survey.responseCount > 0) {
      responseRate = (totalResponses / survey.responseCount) * 100;
    }

    const scoreDistribution: Record<string, number> = {};
    responses.forEach((r) => {
      if (r.score !== null) {
        const key = r.score.toString();
        scoreDistribution[key] = (scoreDistribution[key] || 0) + 1;
      }
    });

    return {
      surveyId,
      surveyTitle: survey.title,
      totalResponses,
      averageScore: avgScore,
      responseRate: Math.round(responseRate * 100) / 100,
      scoreDistribution,
      responses,
    };
  },

  submitPublic: async (
    surveyId: string,
    data: {
      contactId?: string | null;
      customerId?: string | null;
      answers: Record<string, any>;
      score?: number | null;
      comment?: string | null;
    },
    ipAddress?: string
  ) => {
    const survey = await surveyRepository.findById(surveyId);
    if (!survey || survey.deletedAt) {
      throw Object.assign(new Error('Survey not found'), { statusCode: 404 });
    }
    if (survey.status !== 'Active') {
      throw Object.assign(new Error('Survey is not active'), { statusCode: 400 });
    }

    const response = await prisma.surveyResponse.create({
      data: {
        surveyId,
        contactId: data.contactId || null,
        customerId: data.customerId || null,
        answers: data.answers || {},
        score: data.score || null,
        comment: data.comment || null,
        ipAddress: ipAddress || null,
      },
    });

    // Update survey stats
    const stats = await prisma.surveyResponse.aggregate({
      where: { surveyId },
      _avg: { score: true },
      _count: true,
    });

    await surveyRepository.update(surveyId, {
      responseCount: stats._count,
      averageScore: stats._avg.score || 0,
    });

    return response;
  },
};

export default surveyService;
