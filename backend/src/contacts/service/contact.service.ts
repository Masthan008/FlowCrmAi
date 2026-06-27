import { contactRepository } from '../repository/contact.repository';
import { auditLogRepository } from '../../repositories/auditLog.repository';
import { prisma } from '../../database/db';

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

export const contactService = {
  /**
   * List contacts with pagination, filters, and search
   */
  list: async (params: any, currentUserId?: string) => {
    return contactRepository.paginateWithRelations({
      page: params.page ? Number(params.page) : 1,
      limit: params.limit ? Number(params.limit) : 20,
      search: params.search,
      status: params.status,
      owner: params.owner,
      vip: params.vip === 'true' || params.vip === true,
      recentlyAdded: params.recentlyAdded === 'true' || params.recentlyAdded === true,
      customerOnly: params.customerOnly === 'true' || params.customerOnly === true,
      partnerOnly: params.partnerOnly === 'true' || params.partnerOnly === true,
      inactiveOnly: params.inactiveOnly === 'true' || params.inactiveOnly === true,
      archivedOnly: params.archivedOnly === 'true' || params.archivedOnly === true,
      myContactsOnly: params.myContactsOnly === 'true' || params.myContactsOnly === true,
      companyId: params.companyId,
      sortBy: params.sortBy,
      sortDir: params.sortDir,
      currentUserId,
    });
  },

  /**
   * Get single contact by ID
   */
  getById: async (id: string) => {
    const contact = await contactRepository.findByIdWithRelations(id);
    if (!contact) {
      const err = new Error('Contact not found') as any;
      err.statusCode = 404;
      throw err;
    }
    return contact;
  },

  /**
   * Create new contact
   */
  create: async (data: any, currentUserId: string) => {
    const cleaned = cleanData(data);
    const contactNumber = await contactRepository.getNextContactNumber();

    // Map fullName
    const firstName = cleaned.firstName || '';
    const middleName = cleaned.middleName || '';
    const lastName = cleaned.lastName || '';
    const fullName = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim();

    // Create record
    const contact = await contactRepository.create({
      ...cleaned,
      contactNumber,
      fullName,
      createdBy: currentUserId,
      updatedBy: currentUserId,
    });

    // Write audit log
    await auditLogRepository.logEvent({
      userId: currentUserId,
      action: 'CONTACT_CREATED',
      module: 'contacts',
      details: { contactId: contact.id, contactNumber },
    });

    return contact;
  },

  /**
   * Update existing contact
   */
  update: async (id: string, data: any, currentUserId: string) => {
    const existing = await contactRepository.findById(id);
    if (!existing) {
      const err = new Error('Contact not found') as any;
      err.statusCode = 404;
      throw err;
    }

    const cleaned = cleanData(data);

    // Compute new fullName if names are updated
    const firstName = cleaned.firstName !== undefined ? cleaned.firstName : existing.firstName;
    const middleName = cleaned.middleName !== undefined ? cleaned.middleName : existing.middleName;
    const lastName = cleaned.lastName !== undefined ? cleaned.lastName : existing.lastName;
    const fullName = `${firstName || ''} ${middleName ? middleName + ' ' : ''}${lastName || ''}`.trim();

    // Compute update details for history
    const changes: Record<string, any> = {};
    for (const [key, val] of Object.entries(cleaned)) {
      if (existing[key] !== val) {
        changes[key] = { old: existing[key], new: val };
      }
    }

    const contact = await contactRepository.update(id, {
      ...cleaned,
      fullName,
      updatedBy: currentUserId,
    });

    // Write audit log
    await auditLogRepository.logEvent({
      userId: currentUserId,
      action: 'CONTACT_UPDATED',
      module: 'contacts',
      details: { contactId: id, changes },
    });

    return contact;
  },

  /**
   * Soft delete contact
   */
  delete: async (id: string, currentUserId: string) => {
    const existing = await contactRepository.findById(id);
    if (!existing) {
      const err = new Error('Contact not found') as any;
      err.statusCode = 404;
      throw err;
    }

    await contactRepository.softDelete(id, currentUserId);

    // Write audit log
    await auditLogRepository.logEvent({
      userId: currentUserId,
      action: 'CONTACT_DELETED',
      module: 'contacts',
      details: { contactId: id },
    });

    return { success: true };
  },

  /**
   * Bulk status update
   */
  bulkUpdateStatus: async (ids: string[], status: string, currentUserId: string) => {
    await contactRepository.bulkUpdateStatus(ids, status, currentUserId);

    // Write audit log
    await auditLogRepository.logEvent({
      userId: currentUserId,
      action: 'CONTACT_BULK_STATUS_CHANGED',
      module: 'contacts',
      details: { ids, status },
    });

    return { success: true, updatedCount: ids.length };
  },

  /**
   * Bulk owner update
   */
  bulkUpdateOwner: async (ids: string[], ownerId: string, currentUserId: string) => {
    // Validate owner exists
    const employee = await prisma.employee.findUnique({
      where: { id: ownerId, deletedAt: null },
    });
    if (!employee) {
      const err = new Error('Selected contact owner (Employee) not found') as any;
      err.statusCode = 400;
      throw err;
    }

    await contactRepository.bulkUpdateOwner(ids, ownerId, currentUserId);

    // Write audit log
    await auditLogRepository.logEvent({
      userId: currentUserId,
      action: 'CONTACT_BULK_OWNER_CHANGED',
      module: 'contacts',
      details: { ids, ownerId },
    });

    return { success: true, updatedCount: ids.length };
  },

  /**
   * Get statistics
   */
  getStatistics: async (currentUserId?: string) => {
    return contactRepository.getStatistics(currentUserId);
  },
};

export default contactService;
