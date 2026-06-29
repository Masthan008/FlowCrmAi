import { leadRepository } from '../repository/lead.repository';
import { auditLogRepository } from '../../repositories/auditLog.repository';
import { leadHistoryRepository } from '../repository/leadHistory.repository';
import { leadTimelineService } from './leadTimeline.service';
import { prisma } from '../../database/db';

const leadInclude = {
  source: { select: { id: true, name: true } },
  status: { select: { id: true, name: true, color: true, order: true } },
  assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
  tagMappings: { include: { tag: true } },
};

/**
 * Clean empty string values from input data — convert them to null
 */
const cleanData = (data: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === '' || value === undefined) {
      cleaned[key] = null;
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

/**
 * Helper to log modified fields during general updates
 */
const logChangedFields = async (leadId: string, existing: any, updated: any, userId?: string) => {
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
      await leadHistoryRepository.logChange({
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

export const leadService = {
  /**
   * Get paginated leads with filters
   */
  list: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    source?: string;
    priority?: string;
    owner?: string;
    sortBy?: string;
    sortDir?: string;
  }) => {
    return leadRepository.paginateWithRelations({
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
  getById: async (id: string) => {
    const lead = await leadRepository.findWithRelations(id);
    if (!lead) {
      throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
    }
    return lead;
  },

  /**
   * Get comprehensive lead profile 360 view details
   */
  getProfile: async (id: string) => {
    const lead = await leadRepository.findWithRelations(id);
    if (!lead) {
      throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
    }

    // Fetch activities for first/last contact calculation
    const activities = await prisma.leadActivity.findMany({
      where: { leadId: id, deletedAt: null },
      orderBy: { activityDate: 'asc' },
    });

    const firstContact = activities.length > 0 ? activities[0].activityDate : null;
    const lastContact = activities.length > 0 ? activities[activities.length - 1].activityDate : null;

    // Fetch tags via tag relations
    const tagRelations = await prisma.tagRelation.findMany({
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
  create: async (data: any, userId?: string) => {
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

    const lead = await leadRepository.createLead(cleaned);

    // Audit log
    await auditLogRepository.logEvent({
      userId,
      action: 'LEAD_CREATED',
      module: 'leads',
      details: { leadId: lead.id, leadNumber: lead.leadNumber },
      createdBy: userId || 'system',
    });

    // History log
    await leadHistoryRepository.logChange({
      leadId: lead.id,
      action: 'Created',
      fieldName: 'Lead Record',
      oldValue: 'None',
      newValue: `Lead created with number ${lead.leadNumber}`,
      userId,
      createdBy: userId || 'system',
    });

    // Timeline log
    await leadTimelineService.logEvent({
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
  update: async (id: string, data: any, userId?: string) => {
    // Verify lead exists
    const existing = await leadRepository.findWithRelations(id);
    if (!existing) {
      throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
    }

    const cleaned = cleanData(data);

    if (cleaned.expectedClosingDate) {
      cleaned.expectedClosingDate = new Date(cleaned.expectedClosingDate);
    }

    cleaned.updatedBy = userId || null;

    const lead = await leadRepository.updateLead(id, cleaned);

    // Audit log
    await auditLogRepository.logEvent({
      userId,
      action: 'LEAD_UPDATED',
      module: 'leads',
      details: { leadId: id, leadNumber: lead.leadNumber },
      createdBy: userId || 'system',
    });

    // Detailed field-level history tracking
    await logChangedFields(id, existing, lead, userId);

    // Timeline log
    await leadTimelineService.logEvent({
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
  delete: async (id: string, userId?: string) => {
    const existing = await leadRepository.findWithRelations(id);
    if (!existing) {
      throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
    }

    const lead = await leadRepository.softDelete(id, userId || null);

    await auditLogRepository.logEvent({
      userId,
      action: 'LEAD_DELETED',
      module: 'leads',
      details: { leadId: id, leadNumber: existing.leadNumber },
      createdBy: userId || 'system',
    });

    // History log
    await leadHistoryRepository.logChange({
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
  updateStatus: async (id: string, statusId: string, userId?: string) => {
    const existing = await leadRepository.findWithRelations(id);
    if (!existing) {
      throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
    }

    const lead = await leadRepository.updateStatus(id, statusId, userId || '');

    await auditLogRepository.logEvent({
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
    await leadHistoryRepository.logChange({
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
    if (lead.status?.name === 'Won') timelineType = 'WON';
    else if (lead.status?.name === 'Lost') timelineType = 'LOST';

    await leadTimelineService.logEvent({
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
  updateOwner: async (id: string, assignedToId: string, userId?: string) => {
    const existing = await leadRepository.findWithRelations(id);
    if (!existing) {
      throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
    }

    const lead = await leadRepository.updateOwner(id, assignedToId, userId || '');

    await auditLogRepository.logEvent({
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
    
    await leadHistoryRepository.logChange({
      leadId: id,
      action: 'Owner Changed',
      fieldName: 'Lead Owner',
      oldValue: oldOwnerName,
      newValue: newOwnerName,
      userId,
      createdBy: userId || 'system',
    });

    // Timeline log
    await leadTimelineService.logEvent({
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
  updatePriority: async (id: string, priority: string, userId?: string) => {
    const existing = await leadRepository.findWithRelations(id);
    if (!existing) {
      throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
    }

    const lead = await leadRepository.updatePriority(id, priority, userId || '');

    await auditLogRepository.logEvent({
      userId,
      action: 'LEAD_PRIORITY_CHANGED',
      module: 'leads',
      details: { leadId: id, oldPriority: existing.priority, newPriority: priority },
      createdBy: userId || 'system',
    });

    // History log
    await leadHistoryRepository.logChange({
      leadId: id,
      action: 'Priority Changed',
      fieldName: 'Priority',
      oldValue: existing.priority,
      newValue: priority,
      userId,
      createdBy: userId || 'system',
    });

    // Timeline log
    await leadTimelineService.logEvent({
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
  updateRating: async (id: string, rating: number, userId?: string) => {
    const existing = await leadRepository.findWithRelations(id);
    if (!existing) {
      throw Object.assign(new Error('Lead not found'), { statusCode: 404 });
    }

    const lead = await leadRepository.updateRating(id, rating, userId || '');

    await auditLogRepository.logEvent({
      userId,
      action: 'LEAD_RATING_CHANGED',
      module: 'leads',
      details: { leadId: id, oldRating: existing.rating, newRating: rating },
      createdBy: userId || 'system',
    });

    // History log
    await leadHistoryRepository.logChange({
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
    return leadRepository.getStatistics();
  },

  /**
   * Get all lead sources (master data)
   */
  getSources: async () => {
    return leadRepository.getSources();
  },

  /**
   * Get all lead statuses (master data)
   */
  getStatuses: async () => {
    return leadRepository.getStatuses();
  },

  /**
   * Get all employees (master data)
   */
  getEmployees: async () => {
    return leadRepository.getEmployees();
  },

  /**
   * Global Search
   */
  globalSearch: async (params: { query: string; page?: number; limit?: number }) => {
    return leadRepository.globalSearch(params);
  },

  /**
   * Advanced Filter builder
   */
  advancedFilter: async (params: {
    filters: any;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortDir?: string;
  }) => {
    return leadRepository.advancedFilter(params);
  },

  /**
   * Bulk Update leads
   */
  bulkUpdate: async (params: {
    ids: string[];
    statusId?: string;
    priority?: string;
    rating?: number;
    assignedToId?: string;
    sourceId?: string;
    industry?: string;
    tags?: string[];
    userId?: string;
  }) => {
    return leadRepository.bulkUpdate(params);
  },

  /**
   * Archive leads list
   */
  archiveLeads: async (ids: string[], archivedBy: string) => {
    return leadRepository.archiveLeads(ids, archivedBy);
  },

  /**
   * Restore leads list
   */
  restoreLeads: async (ids: string[]) => {
    return leadRepository.restoreLeads(ids);
  },

  /**
   * Merge duplicates records into primary
   */
  mergeLeads: async (params: {
    primaryId: string;
    secondaryIds: string[];
    fieldValues: any;
    userId: string;
  }) => {
    return leadRepository.mergeLeads(params);
  },

  /**
   * Custom Views
   */
  saveView: async (userId: string, data: any) => {
    const { id, name, filters, columns, isDefault, isPinned } = data;
    if (id) {
      return prisma.savedView.update({
        where: { id, userId },
        data: { name, filters, columns, isDefault, isPinned },
      });
    }
    return prisma.savedView.create({
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

  getViews: async (userId: string) => {
    return prisma.savedView.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  },

  deleteView: async (id: string, userId: string) => {
    return prisma.savedView.delete({
      where: { id, userId },
    });
  },

  /**
   * Rollback Transaction Safe Leads CSV Importer
   */
  importLeads: async (userId: string, fileName: string, rows: any[], mapping: any) => {
    let successCount = 0;
    let failedCount = 0;
    let duplicateCount = 0;
    let errorDetails = '';

    try {
      // Retrieve initial next index before starting transaction to avoid concurrency unique index collisions
      const lastLead = await prisma.lead.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { leadNumber: true },
      });

      let nextNum = 1;
      if (lastLead?.leadNumber) {
        const parts = lastLead.leadNumber.split('-');
        const num = parseInt(parts[1], 10);
        if (!isNaN(num)) nextNum = num + 1;
      }

      // Transaction wrapper ensures ALL or NOTHING rollback
      await prisma.$transaction(async (tx) => {
        for (const row of rows) {
          // Map fields using user custom configurations
          const mappedData: any = {};
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
              ].filter(Boolean) as any,
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
      await prisma.leadImportLog.create({
        data: {
          fileName,
          totalRows: rows.length,
          successCount,
          failedCount,
          importedById: userId,
        },
      });

      return { success: true, successCount, failedCount, duplicateCount };
    } catch (err: any) {
      errorDetails = err.message || 'CSV row validation failed.';
      // Log failed import audit
      await prisma.leadImportLog.create({
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
  exportLeads: async (userId: string, type: string, params: {
    selectedIds?: string[];
    filters?: any;
    pageLeads?: string[];
  }) => {
    let leadsToExport: any[] = [];

    if (params.selectedIds && params.selectedIds.length > 0) {
      leadsToExport = await prisma.lead.findMany({
        where: { id: { in: params.selectedIds }, deletedAt: null },
        include: leadInclude,
      });
    } else if (params.filters) {
      const advancedResult = await leadRepository.advancedFilter({
        filters: params.filters,
        limit: 10000,
      });
      leadsToExport = advancedResult.items;
    } else if (params.pageLeads && params.pageLeads.length > 0) {
      leadsToExport = await prisma.lead.findMany({
        where: { id: { in: params.pageLeads }, deletedAt: null },
        include: leadInclude,
      });
    } else {
      leadsToExport = await prisma.lead.findMany({
        where: { deletedAt: null },
        include: leadInclude,
      });
    }

    // Save Export Log
    await prisma.leadExportLog.create({
      data: {
        exportType: type.toUpperCase(),
        rowsExported: leadsToExport.length,
        userId,
      },
    });

    return leadsToExport;
  },
};

export default leadService;
