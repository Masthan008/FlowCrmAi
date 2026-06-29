"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyService = void 0;
const db_1 = require("../../database/db");
const company_repository_1 = require("../repository/company.repository");
const auditLog_repository_1 = require("../../repositories/auditLog.repository");
const cleanData = (data) => {
    const cleaned = {};
    for (const [key, value] of Object.entries(data)) {
        if (value === '' || value === undefined) {
            cleaned[key] = null;
        }
        else {
            cleaned[key] = value;
        }
    }
    return cleaned;
};
exports.companyService = {
    list: async (params, currentUserId) => {
        return company_repository_1.companyRepository.paginateWithRelations({
            page: params.page ? Number(params.page) : 1,
            limit: params.limit ? Number(params.limit) : 20,
            search: params.search,
            status: params.status,
            industry: params.industry,
            country: params.country,
            state: params.state,
            owner: params.owner,
            priority: params.priority,
            rating: params.rating,
            minRevenue: params.minRevenue ? Number(params.minRevenue) : undefined,
            maxRevenue: params.maxRevenue ? Number(params.maxRevenue) : undefined,
            minEmployees: params.minEmployees ? Number(params.minEmployees) : undefined,
            maxEmployees: params.maxEmployees ? Number(params.maxEmployees) : undefined,
            fromDate: params.fromDate,
            toDate: params.toDate,
            myCompaniesOnly: params.myCompaniesOnly === 'true' || params.myCompaniesOnly === true,
            customersOnly: params.customersOnly === 'true' || params.customersOnly === true,
            partnersOnly: params.partnersOnly === 'true' || params.partnersOnly === true,
            prospectsOnly: params.prospectsOnly === 'true' || params.prospectsOnly === true,
            recentlyAdded: params.recentlyAdded === 'true' || params.recentlyAdded === true,
            highRevenue: params.highRevenue === 'true' || params.highRevenue === true,
            highPriority: params.highPriority === 'true' || params.highPriority === true,
            archivedOnly: params.archivedOnly === 'true' || params.archivedOnly === true,
            sortBy: params.sortBy,
            sortDir: params.sortDir,
            currentUserId,
        });
    },
    getById: async (id) => {
        const company = await company_repository_1.companyRepository.findByIdWithRelations(id);
        if (!company) {
            const err = new Error('Company not found');
            err.statusCode = 404;
            throw err;
        }
        return company;
    },
    create: async (data, currentUserId) => {
        const cleaned = cleanData(data);
        const companyNumber = await company_repository_1.companyRepository.getNextCompanyNumber();
        const company = await company_repository_1.companyRepository.create({
            ...cleaned,
            companyNumber,
            createdBy: currentUserId,
            updatedBy: currentUserId,
        });
        await auditLog_repository_1.auditLogRepository.logEvent({
            userId: currentUserId,
            action: 'COMPANY_CREATED',
            module: 'companies',
            details: { companyId: company.id, companyNumber },
        });
        return company;
    },
    update: async (id, data, currentUserId) => {
        const existing = await company_repository_1.companyRepository.findById(id);
        if (!existing) {
            const err = new Error('Company not found');
            err.statusCode = 404;
            throw err;
        }
        const cleaned = cleanData(data);
        const company = await company_repository_1.companyRepository.update(id, {
            ...cleaned,
            updatedBy: currentUserId,
        });
        await auditLog_repository_1.auditLogRepository.logEvent({
            userId: currentUserId,
            action: 'COMPANY_UPDATED',
            module: 'companies',
            details: { companyId: id, companyNumber: existing.companyNumber },
        });
        return company;
    },
    delete: async (id, currentUserId) => {
        const existing = await company_repository_1.companyRepository.findById(id);
        if (!existing) {
            const err = new Error('Company not found');
            err.statusCode = 404;
            throw err;
        }
        await company_repository_1.companyRepository.softDelete(id, currentUserId);
        await auditLog_repository_1.auditLogRepository.logEvent({
            userId: currentUserId,
            action: 'COMPANY_DELETED',
            module: 'companies',
            details: { companyId: id, companyNumber: existing.companyNumber },
        });
    },
    bulkUpdateStatus: async (ids, status, currentUserId) => {
        await db_1.prisma.company.updateMany({
            where: { id: { in: ids }, deletedAt: null },
            data: { status, updatedBy: currentUserId },
        });
        await auditLog_repository_1.auditLogRepository.logEvent({
            userId: currentUserId,
            action: 'COMPANY_STATUS_BULK_UPDATED',
            module: 'companies',
            details: { companyIds: ids, status },
        });
    },
    bulkUpdateOwner: async (ids, ownerId, currentUserId) => {
        await db_1.prisma.company.updateMany({
            where: { id: { in: ids }, deletedAt: null },
            data: { ownerId, updatedBy: currentUserId },
        });
        await auditLog_repository_1.auditLogRepository.logEvent({
            userId: currentUserId,
            action: 'COMPANY_OWNER_BULK_UPDATED',
            module: 'companies',
            details: { companyIds: ids, ownerId },
        });
    },
    getStatistics: async (currentUserId) => {
        return company_repository_1.companyRepository.getStatistics(currentUserId);
    },
    getEmployees: async () => {
        return company_repository_1.companyRepository.findEmployees();
    },
};
