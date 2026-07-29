"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webFormService = void 0;
const webform_repository_1 = require("../repository/webform.repository");
const db_1 = require("../../database/db");
exports.webFormService = {
    getWebForms: async (params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
        if (params.search) {
            where.name = { contains: params.search, mode: 'insensitive' };
        }
        const [items, total] = await Promise.all([
            webform_repository_1.webFormRepository.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
            }),
            webform_repository_1.webFormRepository.count(where),
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
    getWebFormById: async (id) => {
        const form = await webform_repository_1.webFormRepository.findById(id);
        if (!form || form.deletedAt) {
            throw Object.assign(new Error('Web form not found'), { statusCode: 404 });
        }
        return form;
    },
    createWebForm: async (data, userId) => {
        if (data.assignToId) {
            const employee = await db_1.prisma.employee.findUnique({ where: { id: data.assignToId } });
            if (!employee) {
                throw Object.assign(new Error('Assigned employee not found'), { statusCode: 400 });
            }
        }
        if (data.sourceId) {
            const source = await db_1.prisma.leadSource.findUnique({ where: { id: data.sourceId } });
            if (!source) {
                throw Object.assign(new Error('Lead source not found'), { statusCode: 400 });
            }
        }
        if (data.statusId) {
            const status = await db_1.prisma.leadStatus.findUnique({ where: { id: data.statusId } });
            if (!status) {
                throw Object.assign(new Error('Lead status not found'), { statusCode: 400 });
            }
        }
        return webform_repository_1.webFormRepository.create({
            ...data,
            fields: data.fields || [],
            submitLabel: data.submitLabel || 'Submit',
            notificationEmails: data.notificationEmails || [],
            createdBy: userId || null,
        });
    },
    updateWebForm: async (id, data, userId) => {
        const existing = await webform_repository_1.webFormRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Web form not found'), { statusCode: 404 });
        }
        if (data.assignToId) {
            const employee = await db_1.prisma.employee.findUnique({ where: { id: data.assignToId } });
            if (!employee) {
                throw Object.assign(new Error('Assigned employee not found'), { statusCode: 400 });
            }
        }
        return webform_repository_1.webFormRepository.update(id, {
            ...data,
            updatedBy: userId || null,
        });
    },
    deleteWebForm: async (id, userId) => {
        const existing = await webform_repository_1.webFormRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Web form not found'), { statusCode: 404 });
        }
        return webform_repository_1.webFormRepository.softDelete(id, userId);
    },
    activateForm: async (id, userId) => {
        const existing = await webform_repository_1.webFormRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Web form not found'), { statusCode: 404 });
        }
        return webform_repository_1.webFormRepository.update(id, { isActive: true, updatedBy: userId || null });
    },
    deactivateForm: async (id, userId) => {
        const existing = await webform_repository_1.webFormRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Web form not found'), { statusCode: 404 });
        }
        return webform_repository_1.webFormRepository.update(id, { isActive: false, updatedBy: userId || null });
    },
    getSubmissions: async (formId, params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = { formId };
        const [items, total] = await Promise.all([
            db_1.prisma.webFormSubmission.findMany({
                skip,
                take: limit,
                where,
                orderBy: { createdAt: 'desc' },
                include: {
                    convertedToLead: {
                        select: { id: true, fullName: true, email: true },
                    },
                },
            }),
            db_1.prisma.webFormSubmission.count({ where }),
        ]);
        return {
            items,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        };
    },
    getEmbedCode: async (id) => {
        const existing = await webform_repository_1.webFormRepository.findById(id);
        if (!existing || existing.deletedAt) {
            throw Object.assign(new Error('Web form not found'), { statusCode: 404 });
        }
        const embedCode = `<div data-flowcrm-form="${id}"></div><script src="https://forms.flowcrm.ai/embed.js" defer></script>`;
        return { embedCode, form: existing };
    },
    submitPublic: async (formId, data, ipAddress, userAgent) => {
        const form = await webform_repository_1.webFormRepository.findById(formId);
        if (!form || form.deletedAt || !form.isActive) {
            throw Object.assign(new Error('Form not found or inactive'), { statusCode: 404 });
        }
        return db_1.prisma.webFormSubmission.create({
            data: {
                formId,
                data: data.data || {},
                ipAddress: ipAddress || null,
                userAgent: userAgent || null,
            },
        });
    },
};
exports.default = exports.webFormService;
