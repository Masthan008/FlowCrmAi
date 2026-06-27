import { leadRepository } from '../repository/lead.repository';
import { auditLogRepository } from '../../repositories/auditLog.repository';

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
   * Create a new lead
   */
  create: async (data: any, userId?: string) => {
    const cleaned = cleanData(data);

    // Handle expectedClosingDate conversion
    if (cleaned.expectedClosingDate) {
      cleaned.expectedClosingDate = new Date(cleaned.expectedClosingDate);
    }

    cleaned.createdBy = userId || null;

    const lead = await leadRepository.createLead(cleaned);

    // Audit log
    await auditLogRepository.logEvent({
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

    await auditLogRepository.logEvent({
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
};

export default leadService;
