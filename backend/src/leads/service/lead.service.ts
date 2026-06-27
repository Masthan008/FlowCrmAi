import { leadRepository } from '../repository/lead.repository';
import { auditLogRepository } from '../../repositories/auditLog.repository';
import { leadHistoryRepository } from '../repository/leadHistory.repository';
import { leadTimelineService } from './leadTimeline.service';
import { prisma } from '../../database/db';

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
};

export default leadService;
