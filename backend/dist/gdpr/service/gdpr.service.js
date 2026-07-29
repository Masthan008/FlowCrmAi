"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gdprService = void 0;
const gdpr_repository_1 = require("../repository/gdpr.repository");
const db_1 = require("../../database/db");
exports.gdprService = {
    getConsentLogs: async (params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (params.contactId)
            where.contactId = params.contactId;
        if (params.companyId)
            where.companyId = params.companyId;
        if (params.type)
            where.type = params.type;
        const [items, total] = await Promise.all([
            gdpr_repository_1.consentLogRepository.findMany({
                skip,
                take: limit,
                where,
                orderBy: { consentDate: 'desc' },
            }),
            gdpr_repository_1.consentLogRepository.count(where),
        ]);
        return {
            items,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        };
    },
    recordConsent: async (data) => {
        if (data.contactId) {
            const contact = await db_1.prisma.contact.findUnique({ where: { id: data.contactId } });
            if (!contact) {
                throw Object.assign(new Error('Contact not found'), { statusCode: 400 });
            }
        }
        if (data.companyId) {
            const company = await db_1.prisma.company.findUnique({ where: { id: data.companyId } });
            if (!company) {
                throw Object.assign(new Error('Company not found'), { statusCode: 400 });
            }
        }
        const createData = {
            contactId: data.contactId || null,
            companyId: data.companyId || null,
            type: data.type,
            granted: data.granted !== undefined ? data.granted : true,
            source: data.source,
            ipAddress: data.ipAddress || null,
            details: data.details || null,
            consentDate: new Date(),
        };
        if (data.expiresAt)
            createData.expiresAt = new Date(data.expiresAt);
        return gdpr_repository_1.consentLogRepository.create(createData);
    },
    revokeConsent: async (id) => {
        const existing = await gdpr_repository_1.consentLogRepository.findById(id);
        if (!existing) {
            throw Object.assign(new Error('Consent log not found'), { statusCode: 404 });
        }
        return gdpr_repository_1.consentLogRepository.update(id, {
            granted: false,
            revokedAt: new Date(),
        });
    },
    getDataRequests: async (params) => {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (params.type)
            where.type = params.type;
        if (params.status)
            where.status = params.status;
        const [items, total] = await Promise.all([
            gdpr_repository_1.dataRequestRepository.findMany({
                skip,
                take: limit,
                where,
                orderBy: { requestedAt: 'desc' },
            }),
            gdpr_repository_1.dataRequestRepository.count(where),
        ]);
        return {
            items,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        };
    },
    createDataRequest: async (data) => {
        const requestNumber = `DR-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        if (data.contactId) {
            const contact = await db_1.prisma.contact.findUnique({ where: { id: data.contactId } });
            if (!contact) {
                throw Object.assign(new Error('Contact not found'), { statusCode: 400 });
            }
        }
        if (data.companyId) {
            const company = await db_1.prisma.company.findUnique({ where: { id: data.companyId } });
            if (!company) {
                throw Object.assign(new Error('Company not found'), { statusCode: 400 });
            }
        }
        return gdpr_repository_1.dataRequestRepository.create({
            requestNumber,
            contactId: data.contactId || null,
            companyId: data.companyId || null,
            type: data.type,
            description: data.description || null,
            status: 'Pending',
        });
    },
    processDataRequest: async (id) => {
        const existing = await gdpr_repository_1.dataRequestRepository.findById(id);
        if (!existing) {
            throw Object.assign(new Error('Data request not found'), { statusCode: 404 });
        }
        if (existing.status !== 'Pending') {
            throw Object.assign(new Error('Only pending requests can be processed'), { statusCode: 400 });
        }
        return gdpr_repository_1.dataRequestRepository.update(id, { status: 'In Progress' });
    },
    completeDataRequest: async (id, responseData) => {
        const existing = await gdpr_repository_1.dataRequestRepository.findById(id);
        if (!existing) {
            throw Object.assign(new Error('Data request not found'), { statusCode: 404 });
        }
        return gdpr_repository_1.dataRequestRepository.update(id, {
            status: 'Completed',
            completedAt: new Date(),
            responseData: responseData || null,
        });
    },
    rejectDataRequest: async (id) => {
        const existing = await gdpr_repository_1.dataRequestRepository.findById(id);
        if (!existing) {
            throw Object.assign(new Error('Data request not found'), { statusCode: 404 });
        }
        if (existing.status === 'Completed') {
            throw Object.assign(new Error('Cannot reject a completed request'), { statusCode: 400 });
        }
        return gdpr_repository_1.dataRequestRepository.update(id, { status: 'Rejected' });
    },
};
exports.default = exports.gdprService;
