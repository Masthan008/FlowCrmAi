"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadService = void 0;
const lead_repository_1 = require("../repository/lead.repository");
const auditLog_repository_1 = require("../../repositories/auditLog.repository");
/**
 * Clean empty string values from input data — convert them to null
 */
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
exports.leadService = {
    /**
     * Get paginated leads with filters
     */
    list: async (params) => {
        return lead_repository_1.leadRepository.paginateWithRelations({
            page: params.page ? Number(params.page) : 1,
            limit: params.limit ? Number(params.limit) : 20,
            search: params.search,
            status: params.status,
            source: params.source,
            priority: params.priority,
            owner: params.owner,
            sortBy: params.sortBy,
            sortDir: params.sortDir,
        });
    },
    /**
     * Get a single lead by ID with relations
     */
    getById: async (id) => {
        const lead = await lead_repository_1.leadRepository.findWithRelations(id);
        if (!lead) {
            throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
        }
        return lead;
    },
    /**
     * Create a new lead
     */
    create: async (data, userId) => {
        const cleaned = cleanData(data);
        // Handle expectedClosingDate conversion
        if (cleaned.expectedClosingDate) {
            cleaned.expectedClosingDate = new Date(cleaned.expectedClosingDate);
        }
        cleaned.createdBy = userId || null;
        const lead = await lead_repository_1.leadRepository.createLead(cleaned);
        // Audit log
        await auditLog_repository_1.auditLogRepository.logEvent({
            userId,
            action: 'LEAD_CREATED',
            module: 'leads',
            details: { leadId: lead.id, leadNumber: lead.leadNumber },
            createdBy: userId || 'system',
        });
        return lead;
    },
    /**
     * Update an existing lead
     */
    update: async (id, data, userId) => {
        // Verify lead exists
        const existing = await lead_repository_1.leadRepository.findWithRelations(id);
        if (!existing) {
            throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
        }
        const cleaned = cleanData(data);
        if (cleaned.expectedClosingDate) {
            cleaned.expectedClosingDate = new Date(cleaned.expectedClosingDate);
        }
        cleaned.updatedBy = userId || null;
        const lead = await lead_repository_1.leadRepository.updateLead(id, cleaned);
        await auditLog_repository_1.auditLogRepository.logEvent({
            userId,
            action: 'LEAD_UPDATED',
            module: 'leads',
            details: { leadId: id, leadNumber: lead.leadNumber },
            createdBy: userId || 'system',
        });
        return lead;
    },
    /**
     * Soft delete a lead
     */
    delete: async (id, userId) => {
        const existing = await lead_repository_1.leadRepository.findWithRelations(id);
        if (!existing) {
            throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
        }
        const lead = await lead_repository_1.leadRepository.softDelete(id, userId || null);
        await auditLog_repository_1.auditLogRepository.logEvent({
            userId,
            action: 'LEAD_DELETED',
            module: 'leads',
            details: { leadId: id, leadNumber: existing.leadNumber },
            createdBy: userId || 'system',
        });
        return lead;
    },
    /**
     * Update lead status
     */
    updateStatus: async (id, statusId, userId) => {
        const existing = await lead_repository_1.leadRepository.findWithRelations(id);
        if (!existing) {
            throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
        }
        const lead = await lead_repository_1.leadRepository.updateStatus(id, statusId, userId || '');
        await auditLog_repository_1.auditLogRepository.logEvent({
            userId,
            action: 'LEAD_STATUS_CHANGED',
            module: 'leads',
            details: {
                leadId: id,
                oldStatus: existing.status?.name,
                newStatusId: statusId,
            },
            createdBy: userId || 'system',
        });
        return lead;
    },
    /**
     * Update lead owner
     */
    updateOwner: async (id, assignedToId, userId) => {
        const existing = await lead_repository_1.leadRepository.findWithRelations(id);
        if (!existing) {
            throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
        }
        const lead = await lead_repository_1.leadRepository.updateOwner(id, assignedToId, userId || '');
        await auditLog_repository_1.auditLogRepository.logEvent({
            userId,
            action: 'LEAD_OWNER_CHANGED',
            module: 'leads',
            details: {
                leadId: id,
                oldOwner: existing.assignedTo?.email,
                newOwnerId: assignedToId,
            },
            createdBy: userId || 'system',
        });
        return lead;
    },
    /**
     * Update lead priority
     */
    updatePriority: async (id, priority, userId) => {
        const existing = await lead_repository_1.leadRepository.findWithRelations(id);
        if (!existing) {
            throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
        }
        const lead = await lead_repository_1.leadRepository.updatePriority(id, priority, userId || '');
        await auditLog_repository_1.auditLogRepository.logEvent({
            userId,
            action: 'LEAD_PRIORITY_CHANGED',
            module: 'leads',
            details: { leadId: id, oldPriority: existing.priority, newPriority: priority },
            createdBy: userId || 'system',
        });
        return lead;
    },
    /**
     * Update lead rating
     */
    updateRating: async (id, rating, userId) => {
        const existing = await lead_repository_1.leadRepository.findWithRelations(id);
        if (!existing) {
            throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
        }
        const lead = await lead_repository_1.leadRepository.updateRating(id, rating, userId || '');
        await auditLog_repository_1.auditLogRepository.logEvent({
            userId,
            action: 'LEAD_RATING_CHANGED',
            module: 'leads',
            details: { leadId: id, oldRating: existing.rating, newRating: rating },
            createdBy: userId || 'system',
        });
        return lead;
    },
    /**
     * Get lead statistics
     */
    getStatistics: async () => {
        return lead_repository_1.leadRepository.getStatistics();
    },
    /**
     * Get all lead sources (master data)
     */
    getSources: async () => {
        return lead_repository_1.leadRepository.getSources();
    },
    /**
     * Get all lead statuses (master data)
     */
    getStatuses: async () => {
        return lead_repository_1.leadRepository.getStatuses();
    },
};
exports.default = exports.leadService;
