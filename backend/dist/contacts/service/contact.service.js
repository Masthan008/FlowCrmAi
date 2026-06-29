"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactService = void 0;
const contact_repository_1 = require("../repository/contact.repository");
const auditLog_repository_1 = require("../../repositories/auditLog.repository");
const db_1 = require("../../database/db");
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
exports.contactService = {
    /**
     * List contacts with pagination, filters, and search
     */
    list: async (params, currentUserId) => {
        return contact_repository_1.contactRepository.paginateWithRelations({
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
    getById: async (id) => {
        const contact = await contact_repository_1.contactRepository.findByIdWithRelations(id);
        if (!contact) {
            const err = new Error('Contact not found');
            err.statusCode = 404;
            throw err;
        }
        return contact;
    },
    /**
     * Create new contact
     */
    create: async (data, currentUserId) => {
        const cleaned = cleanData(data);
        const contactNumber = await contact_repository_1.contactRepository.getNextContactNumber();
        // Map fullName
        const firstName = cleaned.firstName || '';
        const middleName = cleaned.middleName || '';
        const lastName = cleaned.lastName || '';
        const fullName = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim();
        // Create record
        const contact = await contact_repository_1.contactRepository.create({
            ...cleaned,
            contactNumber,
            fullName,
            createdBy: currentUserId,
            updatedBy: currentUserId,
        });
        // Write audit log
        await auditLog_repository_1.auditLogRepository.logEvent({
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
    update: async (id, data, currentUserId) => {
        const existing = await contact_repository_1.contactRepository.findById(id);
        if (!existing) {
            const err = new Error('Contact not found');
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
        const changes = {};
        for (const [key, val] of Object.entries(cleaned)) {
            if (existing[key] !== val) {
                changes[key] = { old: existing[key], new: val };
            }
        }
        const contact = await contact_repository_1.contactRepository.update(id, {
            ...cleaned,
            fullName,
            updatedBy: currentUserId,
        });
        // Write audit log
        await auditLog_repository_1.auditLogRepository.logEvent({
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
    delete: async (id, currentUserId) => {
        const existing = await contact_repository_1.contactRepository.findById(id);
        if (!existing) {
            const err = new Error('Contact not found');
            err.statusCode = 404;
            throw err;
        }
        await contact_repository_1.contactRepository.softDelete(id, currentUserId);
        // Write audit log
        await auditLog_repository_1.auditLogRepository.logEvent({
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
    bulkUpdateStatus: async (ids, status, currentUserId) => {
        await contact_repository_1.contactRepository.bulkUpdateStatus(ids, status, currentUserId);
        // Write audit log
        await auditLog_repository_1.auditLogRepository.logEvent({
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
    bulkUpdateOwner: async (ids, ownerId, currentUserId) => {
        // Validate owner exists
        const employee = await db_1.prisma.employee.findUnique({
            where: { id: ownerId, deletedAt: null },
        });
        if (!employee) {
            const err = new Error('Selected contact owner (Employee) not found');
            err.statusCode = 400;
            throw err;
        }
        await contact_repository_1.contactRepository.bulkUpdateOwner(ids, ownerId, currentUserId);
        // Write audit log
        await auditLog_repository_1.auditLogRepository.logEvent({
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
    getStatistics: async (currentUserId) => {
        return contact_repository_1.contactRepository.getStatistics(currentUserId);
    },
};
exports.default = exports.contactService;
