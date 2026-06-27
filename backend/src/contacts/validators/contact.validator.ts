import { z } from 'zod';

const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/;

/**
 * Validation: Create Contact
 */
export const createContactSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required').max(100),
    middleName: z.string().max(100).optional().or(z.literal('')),
    lastName: z.string().min(1, 'Last name is required').max(100),
    profilePhoto: z.string().url('Invalid image URL').optional().or(z.literal('')),
    gender: z.string().max(50).optional().or(z.literal('')),
    dateOfBirth: z.string().datetime({ offset: true }).optional().or(z.literal('')),
    jobTitle: z.string().max(150).optional().or(z.literal('')),
    department: z.string().max(100).optional().or(z.literal('')),
    companyId: z.string().uuid('Invalid company ID').optional().or(z.literal('')),
    leadId: z.string().uuid('Invalid lead ID').optional().or(z.literal('')),
    customerId: z.string().uuid('Invalid customer ID').optional().or(z.literal('')),
    
    // Communication
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    secondaryEmail: z.string().email('Invalid secondary email format').optional().or(z.literal('')),
    phone: z.string().regex(phoneRegex, 'Invalid phone format').optional().or(z.literal('')),
    alternatePhone: z.string().regex(phoneRegex, 'Invalid alternate phone format').optional().or(z.literal('')),
    whatsApp: z.string().max(50).optional().or(z.literal('')),
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    
    // Socials
    linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
    twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
    facebook: z.string().url('Invalid Facebook URL').optional().or(z.literal('')),
    instagram: z.string().url('Invalid Instagram URL').optional().or(z.literal('')),
    
    // Address
    country: z.string().max(100).optional().or(z.literal('')),
    state: z.string().max(100).optional().or(z.literal('')),
    city: z.string().max(100).optional().or(z.literal('')),
    postalCode: z.string().max(20).optional().or(z.literal('')),
    addressLine1: z.string().max(200).optional().or(z.literal('')),
    addressLine2: z.string().max(200).optional().or(z.literal('')),
    
    // Status & Owner
    status: z.enum(['Active', 'Inactive', 'VIP', 'Prospect', 'Customer', 'Partner', 'Vendor', 'Former Customer', 'Archived']).optional(),
    ownerId: z.string().uuid('Invalid owner ID').optional().or(z.literal('')),
    
    // Preferences & Other
    preferredLanguage: z.string().max(50).optional().or(z.literal('')),
    preferredContactMethod: z.string().max(50).optional().or(z.literal('')),
    timezone: z.string().max(50).optional().or(z.literal('')),
    tags: z.array(z.string()).optional(),
    description: z.string().max(5000).optional().or(z.literal('')),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

/**
 * Validation: Update Contact
 */
export const updateContactSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required').max(100).optional(),
    middleName: z.string().max(100).optional().or(z.literal('')),
    lastName: z.string().min(1, 'Last name is required').max(100).optional(),
    profilePhoto: z.string().url('Invalid image URL').optional().or(z.literal('')),
    gender: z.string().max(50).optional().or(z.literal('')),
    dateOfBirth: z.string().datetime({ offset: true }).optional().or(z.literal('')),
    jobTitle: z.string().max(150).optional().or(z.literal('')),
    department: z.string().max(100).optional().or(z.literal('')),
    companyId: z.string().uuid('Invalid company ID').optional().or(z.literal('')),
    leadId: z.string().uuid('Invalid lead ID').optional().or(z.literal('')),
    customerId: z.string().uuid('Invalid customer ID').optional().or(z.literal('')),
    
    // Communication
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    secondaryEmail: z.string().email('Invalid secondary email format').optional().or(z.literal('')),
    phone: z.string().regex(phoneRegex, 'Invalid phone format').optional().or(z.literal('')),
    alternatePhone: z.string().regex(phoneRegex, 'Invalid alternate phone format').optional().or(z.literal('')),
    whatsApp: z.string().max(50).optional().or(z.literal('')),
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    
    // Socials
    linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
    twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
    facebook: z.string().url('Invalid Facebook URL').optional().or(z.literal('')),
    instagram: z.string().url('Invalid Instagram URL').optional().or(z.literal('')),
    
    // Address
    country: z.string().max(100).optional().or(z.literal('')),
    state: z.string().max(100).optional().or(z.literal('')),
    city: z.string().max(100).optional().or(z.literal('')),
    postalCode: z.string().max(20).optional().or(z.literal('')),
    addressLine1: z.string().max(200).optional().or(z.literal('')),
    addressLine2: z.string().max(200).optional().or(z.literal('')),
    
    // Status & Owner
    status: z.enum(['Active', 'Inactive', 'VIP', 'Prospect', 'Customer', 'Partner', 'Vendor', 'Former Customer', 'Archived']).optional(),
    ownerId: z.string().uuid('Invalid owner ID').optional().or(z.literal('')),
    
    // Preferences & Other
    preferredLanguage: z.string().max(50).optional().or(z.literal('')),
    preferredContactMethod: z.string().max(50).optional().or(z.literal('')),
    timezone: z.string().max(50).optional().or(z.literal('')),
    tags: z.array(z.string()).optional(),
    description: z.string().max(5000).optional().or(z.literal('')),
  }),
  params: z.object({
    id: z.string().uuid('Invalid contact ID'),
  }),
  query: z.object({}).optional(),
});

/**
 * Validation: Bulk Update Status
 */
export const bulkUpdateStatusSchema = z.object({
  body: z.object({
    ids: z.array(z.string().uuid('Invalid contact ID')),
    status: z.enum(['Active', 'Inactive', 'VIP', 'Prospect', 'Customer', 'Partner', 'Vendor', 'Former Customer', 'Archived']),
  }),
});

/**
 * Validation: Bulk Update Owner
 */
export const bulkUpdateOwnerSchema = z.object({
  body: z.object({
    ids: z.array(z.string().uuid('Invalid contact ID')),
    ownerId: z.string().uuid('Invalid owner ID'),
  }),
});

/**
 * Validation: Single ID param check
 */
export const getContactByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid contact ID'),
  }),
});
