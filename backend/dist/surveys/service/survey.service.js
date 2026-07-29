"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.surveyService = void 0;
const survey_repository_1 = require("../repository/survey.repository");
const db_1 = require("../../database/db");
exports.surveyService = {
    getSurveys: async (params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (params.search) {
            where.title = { contains: params.search, mode: 'insensitive' };
        }
        if (params.status) {
            where.status = params.status;
        }
        const [items, total] = await Promise.all([
            survey_repository_1.surveyRepository.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
            }),
            survey_repository_1.surveyRepository.count(where),
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
    getSurveyById: async (id) => {
        const survey = await survey_repository_1.surveyRepository.findById(id);
        if (!survey || survey.deletedAt) {
            throw Object.assign(new Error('Survey not found'), { statusCode: 404 });
        }
        return survey;
    },
    createSurvey: async (data, userId) => {
        return survey_repository_1.surveyRepository.create({
            ...data,
            questions: data.questions || [],
            createdBy: userId || null,
        });
    },
    updateSurvey: async (id, data, userId) => {
        const existing = await survey_repository_1.surveyRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Survey not found'), { statusCode: 404 });
        }
        return survey_repository_1.surveyRepository.update(id, { ...data, updatedBy: userId || null });
    },
    deleteSurvey: async (id, userId) => {
        const existing = await survey_repository_1.surveyRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Survey not found'), { statusCode: 404 });
        }
        return survey_repository_1.surveyRepository.softDelete(id, userId);
    },
    activateSurvey: async (id, userId) => {
        const existing = await survey_repository_1.surveyRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Survey not found'), { statusCode: 404 });
        }
        return survey_repository_1.surveyRepository.update(id, { status: 'Active', updatedBy: userId || null });
    },
    closeSurvey: async (id, userId) => {
        const existing = await survey_repository_1.surveyRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Survey not found'), { statusCode: 404 });
        }
        return survey_repository_1.surveyRepository.update(id, { status: 'Closed', updatedBy: userId || null });
    },
    getResponses: async (surveyId, params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = { surveyId };
        const [items, total] = await Promise.all([
            db_1.prisma.surveyResponse.findMany({
                skip,
                take: limit,
                where,
                orderBy: { submittedAt: 'desc' },
                include: {
                    contact: { select: { id: true, fullName: true, email: true } },
                    customer: { select: { id: true, name: true, email: true } },
                },
            }),
            db_1.prisma.surveyResponse.count({ where }),
        ]);
        return {
            items,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        };
    },
    getAnalytics: async (surveyId) => {
        const survey = await survey_repository_1.surveyRepository.findById(surveyId);
        if (!survey || survey.deletedAt) {
            throw Object.assign(new Error('Survey not found'), { statusCode: 404 });
        }
        const [responses, aggregate] = await Promise.all([
            db_1.prisma.surveyResponse.findMany({
                where: { surveyId },
                select: { score: true, comment: true, submittedAt: true },
            }),
            db_1.prisma.surveyResponse.aggregate({
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
        const scoreDistribution = {};
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
    submitPublic: async (surveyId, data, ipAddress) => {
        const survey = await survey_repository_1.surveyRepository.findById(surveyId);
        if (!survey || survey.deletedAt) {
            throw Object.assign(new Error('Survey not found'), { statusCode: 404 });
        }
        if (survey.status !== 'Active') {
            throw Object.assign(new Error('Survey is not active'), { statusCode: 400 });
        }
        const response = await db_1.prisma.surveyResponse.create({
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
        const stats = await db_1.prisma.surveyResponse.aggregate({
            where: { surveyId },
            _avg: { score: true },
            _count: true,
        });
        await survey_repository_1.surveyRepository.update(surveyId, {
            responseCount: stats._count,
            averageScore: stats._avg.score || 0,
        });
        return response;
    },
};
exports.default = exports.surveyService;
