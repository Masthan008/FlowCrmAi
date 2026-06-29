"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContactByIdSchema = exports.bulkUpdateOwnerSchema = exports.bulkUpdateStatusSchema = exports.updateContactSchema = exports.createContactSchema = void 0;
const zod_1 = require("zod");
const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/;
/**
 * Validation: Create Contact
 */
exports.createContactSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1, 'First name is required').max(100),
        middleName: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        lastName: zod_1.z.string().min(1, 'Last name is required').max(100),
        profilePhoto: zod_1.z.string().url('Invalid image URL').optional().or(zod_1.z.literal('')),
        gender: zod_1.z.string().max(50).optional().or(zod_1.z.literal('')),
        dateOfBirth: zod_1.z.string().datetime({ offset: true }).optional().or(zod_1.z.literal('')),
        jobTitle: zod_1.z.string().max(150).optional().or(zod_1.z.literal('')),
        department: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        companyId: zod_1.z.string().uuid('Invalid company ID').optional().or(zod_1.z.literal('')),
        leadId: zod_1.z.string().uuid('Invalid lead ID').optional().or(zod_1.z.literal('')),
        customerId: zod_1.z.string().uuid('Invalid customer ID').optional().or(zod_1.z.literal('')),
        // Communication
        email: zod_1.z.string().email('Invalid email format').optional().or(zod_1.z.literal('')),
        secondaryEmail: zod_1.z.string().email('Invalid secondary email format').optional().or(zod_1.z.literal('')),
        phone: zod_1.z.string().regex(phoneRegex, 'Invalid phone format').optional().or(zod_1.z.literal('')),
        alternatePhone: zod_1.z.string().regex(phoneRegex, 'Invalid alternate phone format').optional().or(zod_1.z.literal('')),
        whatsApp: zod_1.z.string().max(50).optional().or(zod_1.z.literal('')),
        website: zod_1.z.string().url('Invalid website URL').optional().or(zod_1.z.literal('')),
        // Socials
        linkedin: zod_1.z.string().url('Invalid LinkedIn URL').optional().or(zod_1.z.literal('')),
        twitter: zod_1.z.string().url('Invalid Twitter URL').optional().or(zod_1.z.literal('')),
        facebook: zod_1.z.string().url('Invalid Facebook URL').optional().or(zod_1.z.literal('')),
        instagram: zod_1.z.string().url('Invalid Instagram URL').optional().or(zod_1.z.literal('')),
        // Address
        country: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        state: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        city: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        postalCode: zod_1.z.string().max(20).optional().or(zod_1.z.literal('')),
        addressLine1: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
        addressLine2: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
        // Status & Owner
        status: zod_1.z.enum(['Active', 'Inactive', 'VIP', 'Prospect', 'Customer', 'Partner', 'Vendor', 'Former Customer', 'Archived']).optional(),
        ownerId: zod_1.z.string().uuid('Invalid owner ID').optional().or(zod_1.z.literal('')),
        // Preferences & Other
        preferredLanguage: zod_1.z.string().max(50).optional().or(zod_1.z.literal('')),
        preferredContactMethod: zod_1.z.string().max(50).optional().or(zod_1.z.literal('')),
        timezone: zod_1.z.string().max(50).optional().or(zod_1.z.literal('')),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        description: zod_1.z.string().max(5000).optional().or(zod_1.z.literal('')),
    }),
    params: zod_1.z.object({}).optional(),
    query: zod_1.z.object({}).optional(),
});
/**
 * Validation: Update Contact
 */
exports.updateContactSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1, 'First name is required').max(100).optional(),
        middleName: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        lastName: zod_1.z.string().min(1, 'Last name is required').max(100).optional(),
        profilePhoto: zod_1.z.string().url('Invalid image URL').optional().or(zod_1.z.literal('')),
        gender: zod_1.z.string().max(50).optional().or(zod_1.z.literal('')),
        dateOfBirth: zod_1.z.string().datetime({ offset: true }).optional().or(zod_1.z.literal('')),
        jobTitle: zod_1.z.string().max(150).optional().or(zod_1.z.literal('')),
        department: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        companyId: zod_1.z.string().uuid('Invalid company ID').optional().or(zod_1.z.literal('')),
        leadId: zod_1.z.string().uuid('Invalid lead ID').optional().or(zod_1.z.literal('')),
        customerId: zod_1.z.string().uuid('Invalid customer ID').optional().or(zod_1.z.literal('')),
        // Communication
        email: zod_1.z.string().email('Invalid email format').optional().or(zod_1.z.literal('')),
        secondaryEmail: zod_1.z.string().email('Invalid secondary email format').optional().or(zod_1.z.literal('')),
        phone: zod_1.z.string().regex(phoneRegex, 'Invalid phone format').optional().or(zod_1.z.literal('')),
        alternatePhone: zod_1.z.string().regex(phoneRegex, 'Invalid alternate phone format').optional().or(zod_1.z.literal('')),
        whatsApp: zod_1.z.string().max(50).optional().or(zod_1.z.literal('')),
        website: zod_1.z.string().url('Invalid website URL').optional().or(zod_1.z.literal('')),
        // Socials
        linkedin: zod_1.z.string().url('Invalid LinkedIn URL').optional().or(zod_1.z.literal('')),
        twitter: zod_1.z.string().url('Invalid Twitter URL').optional().or(zod_1.z.literal('')),
        facebook: zod_1.z.string().url('Invalid Facebook URL').optional().or(zod_1.z.literal('')),
        instagram: zod_1.z.string().url('Invalid Instagram URL').optional().or(zod_1.z.literal('')),
        // Address
        country: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        state: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        city: zod_1.z.string().max(100).optional().or(zod_1.z.literal('')),
        postalCode: zod_1.z.string().max(20).optional().or(zod_1.z.literal('')),
        addressLine1: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
        addressLine2: zod_1.z.string().max(200).optional().or(zod_1.z.literal('')),
        // Status & Owner
        status: zod_1.z.enum(['Active', 'Inactive', 'VIP', 'Prospect', 'Customer', 'Partner', 'Vendor', 'Former Customer', 'Archived']).optional(),
        ownerId: zod_1.z.string().uuid('Invalid owner ID').optional().or(zod_1.z.literal('')),
        // Preferences & Other
        preferredLanguage: zod_1.z.string().max(50).optional().or(zod_1.z.literal('')),
        preferredContactMethod: zod_1.z.string().max(50).optional().or(zod_1.z.literal('')),
        timezone: zod_1.z.string().max(50).optional().or(zod_1.z.literal('')),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        description: zod_1.z.string().max(5000).optional().or(zod_1.z.literal('')),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid contact ID'),
    }),
    query: zod_1.z.object({}).optional(),
});
/**
 * Validation: Bulk Update Status
 */
exports.bulkUpdateStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string().uuid('Invalid contact ID')),
        status: zod_1.z.enum(['Active', 'Inactive', 'VIP', 'Prospect', 'Customer', 'Partner', 'Vendor', 'Former Customer', 'Archived']),
    }),
});
/**
 * Validation: Bulk Update Owner
 */
exports.bulkUpdateOwnerSchema = zod_1.z.object({
    body: zod_1.z.object({
        ids: zod_1.z.array(zod_1.z.string().uuid('Invalid contact ID')),
        ownerId: zod_1.z.string().uuid('Invalid owner ID'),
    }),
});
/**
 * Validation: Single ID param check
 */
exports.getContactByIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid contact ID'),
    }),
});
