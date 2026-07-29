"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.surveyResponseSchema = exports.updateSurveySchema = exports.createSurveySchema = void 0;
const zod_1 = require("zod");
exports.createSurveySchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Survey title is required').max(300),
        description: zod_1.z.string().max(5000).optional().nullable(),
        type: zod_1.z.enum(['NPS', 'CSAT', 'CES', 'Custom']).optional().default('NPS'),
        questions: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            type: zod_1.z.enum(['rating', 'single_choice', 'multiple_choice', 'text', 'boolean']),
            question: zod_1.z.string(),
            options: zod_1.z.array(zod_1.z.string()).optional(),
            required: zod_1.z.boolean().optional().default(false),
        })).optional().default([]),
        targetAudience: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional().nullable(),
        sendMethod: zod_1.z.enum(['Email', 'Portal', 'Link']).optional().default('Email'),
        templateId: zod_1.z.string().uuid('Invalid template ID').optional().nullable(),
    }),
});
exports.updateSurveySchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Survey title cannot be empty').max(300).optional(),
        description: zod_1.z.string().max(5000).optional().nullable(),
        type: zod_1.z.enum(['NPS', 'CSAT', 'CES', 'Custom']).optional(),
        questions: zod_1.z.array(zod_1.z.object({
            id: zod_1.z.string(),
            type: zod_1.z.enum(['rating', 'single_choice', 'multiple_choice', 'text', 'boolean']),
            question: zod_1.z.string(),
            options: zod_1.z.array(zod_1.z.string()).optional(),
            required: zod_1.z.boolean().optional().default(false),
        })).optional(),
        targetAudience: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional().nullable(),
        sendMethod: zod_1.z.enum(['Email', 'Portal', 'Link']).optional(),
        templateId: zod_1.z.string().uuid('Invalid template ID').optional().nullable(),
    }),
});
exports.surveyResponseSchema = zod_1.z.object({
    body: zod_1.z.object({
        contactId: zod_1.z.string().uuid('Invalid contact ID').optional().nullable(),
        customerId: zod_1.z.string().uuid('Invalid customer ID').optional().nullable(),
        answers: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
        score: zod_1.z.number().int().optional().nullable(),
        comment: zod_1.z.string().max(5000).optional().nullable(),
    }),
});
