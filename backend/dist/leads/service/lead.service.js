"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadService = void 0;
const lead_repository_1 = require("../repository/lead.repository");
const auditLog_repository_1 = require("../../repositories/auditLog.repository");
const leadHistory_repository_1 = require("../repository/leadHistory.repository");
const leadTimeline_service_1 = require("./leadTimeline.service");
const db_1 = require("../../database/db");
const leadInclude = {
    source: { select: { id: true, name: true } },
    status: { select: { id: true, name: true, color: true, order: true } },
    assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
    tagMappings: { include: { tag: true } },
};
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
/**
 * Helper to log modified fields during general updates
 */
const logChangedFields = async (leadId, existing, updated, userId) => {
    const fieldsToTrack = [
        { key: 'firstName', name: 'First Name' },
        { key: 'lastName', name: 'Last Name' },
        { key: 'email', name: 'Email' },
        { key: 'phone', name: 'Phone' },
        { key: 'companyName', name: 'Company Name' },
        { key: 'jobTitle', name: 'Job Title' },
        { key: 'industry', name: 'Industry' },
        { key: 'website', name: 'Website' },
        { key: 'address', name: 'Address' },
        { key: 'city', name: 'City' },
        { key: 'state', name: 'State' },
        { key: 'country', name: 'Country' },
        { key: 'postalCode', name: 'Postal Code' },
        { key: 'value', name: 'Deal Value' },
        { key: 'description', name: 'Description' },
    ];
    for (const field of fieldsToTrack) {
        const oldVal = existing[field.key];
        const newVal = updated[field.key];
        if (oldVal !== newVal && !(oldVal === null && newVal === '')) {
            await leadHistory_repository_1.leadHistoryRepository.logChange({
                leadId,
                action: 'Updated',
                fieldName: field.name,
                oldValue: oldVal !== null && oldVal !== undefined ? String(oldVal) : 'Empty',
                newValue: newVal !== null && newVal !== undefined ? String(newVal) : 'Empty',
                userId,
                createdBy: userId || 'system',
            });
        }
    }
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
     * Get comprehensive lead profile 360 view details
     */
    getProfile: async (id) => {
        const lead = await lead_repository_1.leadRepository.findWithRelations(id);
        if (!lead) {
            throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
        }
        // Fetch activities for first/last contact calculation
        const activities = await db_1.prisma.leadActivity.findMany({
            where: { leadId: id, deletedAt: null },
            orderBy: { activityDate: 'asc' },
        });
        const firstContact = activities.length > 0 ? activities[0].activityDate : null;
        const lastContact = activities.length > 0 ? activities[activities.length - 1].activityDate : null;
        // Fetch tags via tag relations
        const tagRelations = await db_1.prisma.tagRelation.findMany({
            where: { entityId: id, entityType: 'lead', deletedAt: null },
            include: { tag: true },
        });
        const tags = tagRelations.map((tr) => tr.tag);
        return {
            ...lead,
            tags,
            statistics: {
                firstContact,
                lastContact,
                createdAt: lead.createdAt,
                updatedAt: lead.updatedAt,
                createdBy: lead.createdBy,
                updatedBy: lead.updatedBy,
            },
        };
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
        // Add default empty JSON if socialLinks not provided
        if (!cleaned.socialLinks) {
            cleaned.socialLinks = {};
        }
        const lead = await lead_repository_1.leadRepository.createLead(cleaned);
        // Audit log
        await auditLog_repository_1.auditLogRepository.logEvent({
            userId,
            action: 'LEAD_CREATED',
            module: 'leads',
            details: { leadId: lead.id, leadNumber: lead.leadNumber },
            createdBy: userId || 'system',
        });
        // History log
        await leadHistory_repository_1.leadHistoryRepository.logChange({
            leadId: lead.id,
            action: 'Created',
            fieldName: 'Lead Record',
            oldValue: 'None',
            newValue: `Lead created with number ${lead.leadNumber}`,
            userId,
            createdBy: userId || 'system',
        });
        // Timeline log
        await leadTimeline_service_1.leadTimelineService.logEvent({
            leadId: lead.id,
            type: 'LEAD_CREATED',
            title: 'Lead Created',
            description: `Lead profile was created successfully. Initial value assigned: $${lead.value.toLocaleString()}`,
            icon: 'UserCheck',
            color: '#10B981',
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
        // Audit log
        await auditLog_repository_1.auditLogRepository.logEvent({
            userId,
            action: 'LEAD_UPDATED',
            module: 'leads',
            details: { leadId: id, leadNumber: lead.leadNumber },
            createdBy: userId || 'system',
        });
        // Detailed field-level history tracking
        await logChangedFields(id, existing, lead, userId);
        // Timeline log
        await leadTimeline_service_1.leadTimelineService.logEvent({
            leadId: id,
            type: 'LEAD_UPDATED',
            title: 'Lead Updated',
            description: 'Profile information was modified.',
            icon: 'User',
            color: '#3B82F6',
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
        // History log
        await leadHistory_repository_1.leadHistoryRepository.logChange({
            leadId: id,
            action: 'Deleted',
            fieldName: 'Lead Record',
            oldValue: existing.fullName,
            newValue: 'Soft Deleted',
            userId,
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
        // History log
        await leadHistory_repository_1.leadHistoryRepository.logChange({
            leadId: id,
            action: 'Status Changed',
            fieldName: 'Status',
            oldValue: existing.status?.name || 'None',
            newValue: lead.status?.name || 'None',
            userId,
            createdBy: userId || 'system',
        });
        // Timeline log
        let timelineType = 'STATUS_CHANGED';
        if (lead.status?.name === 'Won')
            timelineType = 'WON';
        else if (lead.status?.name === 'Lost')
            timelineType = 'LOST';
        await leadTimeline_service_1.leadTimelineService.logEvent({
            leadId: id,
            type: timelineType,
            title: `Status: ${lead.status?.name}`,
            description: `Lead status changed from "${existing.status?.name || 'None'}" to "${lead.status?.name || 'None'}".`,
            icon: 'Activity',
            color: lead.status?.color || '#3B82F6',
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
        // History log
        const oldOwnerName = existing.assignedTo ? `${existing.assignedTo.firstName} ${existing.assignedTo.lastName}` : 'Unassigned';
        const newOwnerName = lead.assignedTo ? `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : 'Unassigned';
        await leadHistory_repository_1.leadHistoryRepository.logChange({
            leadId: id,
            action: 'Owner Changed',
            fieldName: 'Lead Owner',
            oldValue: oldOwnerName,
            newValue: newOwnerName,
            userId,
            createdBy: userId || 'system',
        });
        // Timeline log
        await leadTimeline_service_1.leadTimelineService.logEvent({
            leadId: id,
            type: 'OWNER_CHANGED',
            title: 'Owner Assigned',
            description: `Ownership transferred from ${oldOwnerName} to ${newOwnerName}.`,
            icon: 'UserCheck',
            color: '#8B5CF6',
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
        // History log
        await leadHistory_repository_1.leadHistoryRepository.logChange({
            leadId: id,
            action: 'Priority Changed',
            fieldName: 'Priority',
            oldValue: existing.priority,
            newValue: priority,
            userId,
            createdBy: userId || 'system',
        });
        // Timeline log
        await leadTimeline_service_1.leadTimelineService.logEvent({
            leadId: id,
            type: 'LEAD_UPDATED',
            title: 'Priority Updated',
            description: `Lead priority set to "${priority}" (was "${existing.priority}").`,
            icon: 'AlertCircle',
            color: priority === 'Critical' || priority === 'High' ? '#EF4444' : '#3B82F6',
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
        // History log
        await leadHistory_repository_1.leadHistoryRepository.logChange({
            leadId: id,
            action: 'Rating Changed',
            fieldName: 'Rating',
            oldValue: `${existing.rating} Stars`,
            newValue: `${rating} Stars`,
            userId,
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
    /**
     * Get all employees (master data)
     */
    getEmployees: async () => {
        return lead_repository_1.leadRepository.getEmployees();
    },
    /**
     * Global Search
     */
    globalSearch: async (params) => {
        return lead_repository_1.leadRepository.globalSearch(params);
    },
    /**
     * Advanced Filter builder
     */
    advancedFilter: async (params) => {
        return lead_repository_1.leadRepository.advancedFilter(params);
    },
    /**
     * Bulk Update leads
     */
    bulkUpdate: async (params) => {
        return lead_repository_1.leadRepository.bulkUpdate(params);
    },
    /**
     * Archive leads list
     */
    archiveLeads: async (ids, archivedBy) => {
        return lead_repository_1.leadRepository.archiveLeads(ids, archivedBy);
    },
    /**
     * Restore leads list
     */
    restoreLeads: async (ids) => {
        return lead_repository_1.leadRepository.restoreLeads(ids);
    },
    /**
     * Merge duplicates records into primary
     */
    mergeLeads: async (params) => {
        return lead_repository_1.leadRepository.mergeLeads(params);
    },
    /**
     * Custom Views
     */
    saveView: async (userId, data) => {
        const { id, name, filters, columns, isDefault, isPinned } = data;
        if (id) {
            return db_1.prisma.savedView.update({
                where: { id, userId },
                data: { name, filters, columns, isDefault, isPinned },
            });
        }
        return db_1.prisma.savedView.create({
            data: {
                name,
                filters,
                columns,
                isDefault,
                isPinned,
                userId,
            },
        });
    },
    getViews: async (userId) => {
        return db_1.prisma.savedView.findMany({
            where: { userId, deletedAt: null },
            orderBy: { createdAt: 'desc' },
        });
    },
    deleteView: async (id, userId) => {
        return db_1.prisma.savedView.delete({
            where: { id, userId },
        });
    },
    /**
     * Rollback Transaction Safe Leads CSV Importer
     */
    importLeads: async (userId, fileName, rows, mapping) => {
        let successCount = 0;
        let failedCount = 0;
        let duplicateCount = 0;
        let errorDetails = '';
        try {
            // Retrieve initial next index before starting transaction to avoid concurrency unique index collisions
            const lastLead = await db_1.prisma.lead.findFirst({
                orderBy: { createdAt: 'desc' },
                select: { leadNumber: true },
            });
            let nextNum = 1;
            if (lastLead?.leadNumber) {
                const parts = lastLead.leadNumber.split('-');
                const num = parseInt(parts[1], 10);
                if (!isNaN(num))
                    nextNum = num + 1;
            }
            // Transaction wrapper ensures ALL or NOTHING rollback
            await db_1.prisma.$transaction(async (tx) => {
                for (const row of rows) {
                    // Map fields using user custom configurations
                    const mappedData = {};
                    Object.keys(mapping).forEach((schemaKey) => {
                        const fileKey = mapping[schemaKey];
                        if (fileKey && row[fileKey] !== undefined) {
                            mappedData[schemaKey] = String(row[fileKey]).trim();
                        }
                    });
                    // Required fields validation
                    if (!mappedData.firstName || !mappedData.lastName) {
                        failedCount++;
                        throw new Error(`Row missing required 'firstName' or 'lastName' attributes: ${JSON.stringify(row)}`);
                    }
                    // Duplicate checks warnings
                    const duplicateCheck = await tx.lead.findFirst({
                        where: {
                            deletedAt: null,
                            OR: [
                                mappedData.email ? { email: mappedData.email } : undefined,
                                mappedData.phone ? { phone: mappedData.phone } : undefined,
                            ].filter(Boolean),
                        },
                    });
                    const leadNumber = `LEAD-${String(nextNum).padStart(5, '0')}`;
                    nextNum++;
                    const newLead = await tx.lead.create({
                        data: {
                            leadNumber,
                            firstName: mappedData.firstName,
                            lastName: mappedData.lastName,
                            fullName: `${mappedData.firstName} ${mappedData.lastName}`,
                            email: mappedData.email || null,
                            phone: mappedData.phone || null,
                            companyName: mappedData.companyName || null,
                            industry: mappedData.industry || null,
                            website: mappedData.website || null,
                            address: mappedData.address || null,
                            city: mappedData.city || null,
                            state: mappedData.state || null,
                            country: mappedData.country || null,
                            priority: mappedData.priority || 'Medium',
                            value: mappedData.value ? parseFloat(mappedData.value) : 0.0,
                            createdBy: userId,
                        },
                    });
                    // Tag association mappings
                    if (mappedData.tags) {
                        const tagsList = String(mappedData.tags).split(',').map((t) => t.trim()).filter(Boolean);
                        for (const tagName of tagsList) {
                            const tag = await tx.leadTag.upsert({
                                where: { name: tagName },
                                update: {},
                                create: { name: tagName },
                            });
                            await tx.leadTagMapping.create({
                                data: { leadId: newLead.id, tagId: tag.id },
                            });
                        }
                    }
                    // Connect duplicate warnings mappings
                    if (duplicateCheck) {
                        duplicateCount++;
                        await tx.leadDuplicate.create({
                            data: {
                                leadId1: duplicateCheck.id,
                                leadId2: newLead.id,
                                reason: duplicateCheck.email === mappedData.email ? 'Same Email' : 'Same Phone',
                                status: 'Pending',
                            },
                        });
                    }
                    successCount++;
                }
            });
            // Log success import
            await db_1.prisma.leadImportLog.create({
                data: {
                    fileName,
                    totalRows: rows.length,
                    successCount,
                    failedCount,
                    importedById: userId,
                },
            });
            return { success: true, successCount, failedCount, duplicateCount };
        }
        catch (err) {
            errorDetails = err.message || 'CSV row validation failed.';
            // Log failed import audit
            await db_1.prisma.leadImportLog.create({
                data: {
                    fileName,
                    totalRows: rows.length,
                    successCount: 0,
                    failedCount: rows.length,
                    errorDetails,
                    importedById: userId,
                },
            });
            throw err;
        }
    },
    /**
     * Export leads records to format files
     */
    exportLeads: async (userId, type, params) => {
        let leadsToExport = [];
        if (params.selectedIds && params.selectedIds.length > 0) {
            leadsToExport = await db_1.prisma.lead.findMany({
                where: { id: { in: params.selectedIds }, deletedAt: null },
                include: leadInclude,
            });
        }
        else if (params.filters) {
            const advancedResult = await lead_repository_1.leadRepository.advancedFilter({
                filters: params.filters,
                limit: 10000,
            });
            leadsToExport = advancedResult.items;
        }
        else if (params.pageLeads && params.pageLeads.length > 0) {
            leadsToExport = await db_1.prisma.lead.findMany({
                where: { id: { in: params.pageLeads }, deletedAt: null },
                include: leadInclude,
            });
        }
        else {
            leadsToExport = await db_1.prisma.lead.findMany({
                where: { deletedAt: null },
                include: leadInclude,
            });
        }
        // Save Export Log
        await db_1.prisma.leadExportLog.create({
            data: {
                exportType: type.toUpperCase(),
                rowsExported: leadsToExport.length,
                userId,
            },
        });
        return leadsToExport;
    },
};
exports.default = exports.leadService;
