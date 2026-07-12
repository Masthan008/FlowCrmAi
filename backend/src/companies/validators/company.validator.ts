import { z } from 'zod';

const exactPhoneRegex = /^\d{10}$/;
const textOnlyRegex = /^[A-Za-z\s]*$/;
const timezoneRegex = /^(UTC|GMT|[A-Za-z_]+\/[A-Za-z_]+)$/;
const currencyRegex = /^[A-Z]{3}$/;
const langRegex = /^[a-z]{2}$/;
const gstRegex = /^[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[0-9a-zA-Z]{1}[zZ]{1}[0-9a-zA-Z]{1}$/;
const panRegex = /^[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}$/;
const alphanumericRegex = /^[a-zA-Z0-9]+$/;

export const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Company name is required').max(200),
    legalName: z.string().max(200).optional().nullable().or(z.literal('')),
    displayName: z.string().max(200).optional().nullable().or(z.literal('')),
    logo: z.string().url('Invalid logo URL').refine(val => {
      if (!val) return true;
      const cleanUrl = val.split('?')[0].split('#')[0];
      return /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(cleanUrl);
    }, 'Logo must be a valid image URL ending with png, jpg, jpeg, gif, svg, webp, or ico').optional().nullable().or(z.literal('')),
    companyType: z.string().max(100).optional().nullable().or(z.literal('')),
    industry: z.string().regex(textOnlyRegex, 'Industry must contain only letters').max(100).optional().nullable().or(z.literal('')),
    subIndustry: z.string().regex(textOnlyRegex, 'Sub Industry must contain only letters').max(100).optional().nullable().or(z.literal('')),
    businessCategory: z.string().regex(textOnlyRegex, 'Business Category must contain only letters').max(100).optional().nullable().or(z.literal('')),
    website: z.string().url('Invalid website URL').optional().nullable().or(z.literal('')),
    primaryEmail: z.string().email('Invalid email format').optional().nullable().or(z.literal('')),
    secondaryEmail: z.string().email('Invalid secondary email format').optional().nullable().or(z.literal('')),
    primaryPhone: z.string().regex(exactPhoneRegex, 'Primary Phone must be exactly 10 digits').optional().nullable().or(z.literal('')),
    secondaryPhone: z.string().regex(exactPhoneRegex, 'Secondary Phone must be exactly 10 digits').optional().nullable().or(z.literal('')),
    whatsApp: z.string().regex(exactPhoneRegex, 'WhatsApp must be exactly 10 digits').optional().nullable().or(z.literal('')),
    gstNumber: z.string().max(50).refine(val => !val || gstRegex.test(val), 'Invalid GST format (e.g. 22AAAAA0000A1Z5)').optional().nullable(),
    taxNumber: z.string().max(50).refine(val => !val || alphanumericRegex.test(val), 'Tax Number must contain only alphanumeric characters').optional().nullable(),
    registrationNumber: z.string().max(50).refine(val => !val || alphanumericRegex.test(val), 'Registration Number must contain only alphanumeric characters').optional().nullable(),
    panNumber: z.string().max(50).refine(val => !val || panRegex.test(val), 'Invalid PAN format (e.g. ABCDE1234F)').optional().nullable(),
    foundedYear: z.number().int().min(1800).max(2100).optional().nullable(),
    annualRevenue: z.number().min(0).optional().nullable(),
    employeeCount: z.number().int().min(0).optional().nullable(),
    ownershipType: z.string().regex(textOnlyRegex, 'Ownership Type must contain only letters').max(50).optional().nullable().or(z.literal('')),
    currency: z.string().regex(currencyRegex, 'Currency must be a valid 3-letter uppercase code').optional().nullable().or(z.literal('')),
    timezone: z.string().regex(timezoneRegex, 'Timezone must be a valid timezone identifier (e.g. UTC, Europe/Copenhagen)').optional().nullable().or(z.literal('')),
    primaryLanguage: z.string().regex(langRegex, 'Primary Language must be a valid 2-letter lowercase code').optional().nullable().or(z.literal('')),
    country: z.string().max(100).refine(val => !val || textOnlyRegex.test(val), 'Country must contain only letters').optional().nullable(),
    state: z.string().max(100).refine(val => !val || textOnlyRegex.test(val), 'State must contain only letters').optional().nullable(),
    city: z.string().max(100).refine(val => !val || textOnlyRegex.test(val), 'City must contain only letters').optional().nullable(),
    postalCode: z.string().max(20).refine(val => !val || /^[0-9]+$/.test(val), 'Postal Code must contain only numbers').optional().nullable(),
    addressLine1: z.string().max(200).optional().nullable().or(z.literal('')),
    addressLine2: z.string().max(200).optional().nullable().or(z.literal('')),
    billingAddress: z.string().max(500).optional().nullable().or(z.literal('')),
    shippingAddress: z.string().max(500).optional().nullable().or(z.literal('')),
    status: z.enum(['Prospect', 'Customer', 'Partner', 'Vendor', 'Supplier', 'Distributor', 'Inactive', 'Archived']).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    rating: z.number().int().min(0).max(5).optional(),
    ownerId: z.string().uuid('Invalid owner ID').optional().nullable().or(z.literal('')),
    parentCompanyId: z.string().uuid('Invalid parent company ID').optional().nullable().or(z.literal('')),
    description: z.string().max(5000).optional().nullable().or(z.literal('')),
    tags: z.array(z.string()).optional(),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateCompanySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Company name is required').max(200).optional(),
    legalName: z.string().max(200).optional().nullable().or(z.literal('')),
    displayName: z.string().max(200).optional().nullable().or(z.literal('')),
    logo: z.string().url('Invalid logo URL').refine(val => {
      if (!val) return true;
      const cleanUrl = val.split('?')[0].split('#')[0];
      return /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(cleanUrl);
    }, 'Logo must be a valid image URL ending with png, jpg, jpeg, gif, svg, webp, or ico').optional().nullable().or(z.literal('')),
    companyType: z.string().max(100).optional().nullable().or(z.literal('')),
    industry: z.string().regex(textOnlyRegex, 'Industry must contain only letters').max(100).optional().nullable().or(z.literal('')),
    subIndustry: z.string().regex(textOnlyRegex, 'Sub Industry must contain only letters').max(100).optional().nullable().or(z.literal('')),
    businessCategory: z.string().regex(textOnlyRegex, 'Business Category must contain only letters').max(100).optional().nullable().or(z.literal('')),
    website: z.string().url('Invalid website URL').optional().nullable().or(z.literal('')),
    primaryEmail: z.string().email('Invalid email format').optional().nullable().or(z.literal('')),
    secondaryEmail: z.string().email('Invalid secondary email format').optional().nullable().or(z.literal('')),
    primaryPhone: z.string().regex(exactPhoneRegex, 'Primary Phone must be exactly 10 digits').optional().nullable().or(z.literal('')),
    secondaryPhone: z.string().regex(exactPhoneRegex, 'Secondary Phone must be exactly 10 digits').optional().nullable().or(z.literal('')),
    whatsApp: z.string().regex(exactPhoneRegex, 'WhatsApp must be exactly 10 digits').optional().nullable().or(z.literal('')),
    gstNumber: z.string().max(50).refine(val => !val || gstRegex.test(val), 'Invalid GST format (e.g. 22AAAAA0000A1Z5)').optional().nullable(),
    taxNumber: z.string().max(50).refine(val => !val || alphanumericRegex.test(val), 'Tax Number must contain only alphanumeric characters').optional().nullable(),
    registrationNumber: z.string().max(50).refine(val => !val || alphanumericRegex.test(val), 'Registration Number must contain only alphanumeric characters').optional().nullable(),
    panNumber: z.string().max(50).refine(val => !val || panRegex.test(val), 'Invalid PAN format (e.g. ABCDE1234F)').optional().nullable(),
    foundedYear: z.number().int().min(1800).max(2100).optional().nullable(),
    annualRevenue: z.number().min(0).optional().nullable(),
    employeeCount: z.number().int().min(0).optional().nullable(),
    ownershipType: z.string().regex(textOnlyRegex, 'Ownership Type must contain only letters').max(50).optional().nullable().or(z.literal('')),
    currency: z.string().regex(currencyRegex, 'Currency must be a valid 3-letter uppercase code').optional().nullable().or(z.literal('')),
    timezone: z.string().regex(timezoneRegex, 'Timezone must be a valid timezone identifier (e.g. UTC, Europe/Copenhagen)').optional().nullable().or(z.literal('')),
    primaryLanguage: z.string().regex(langRegex, 'Primary Language must be a valid 2-letter lowercase code').optional().nullable().or(z.literal('')),
    country: z.string().max(100).refine(val => !val || textOnlyRegex.test(val), 'Country must contain only letters').optional().nullable(),
    state: z.string().max(100).refine(val => !val || textOnlyRegex.test(val), 'State must contain only letters').optional().nullable(),
    city: z.string().max(100).refine(val => !val || textOnlyRegex.test(val), 'City must contain only letters').optional().nullable(),
    postalCode: z.string().max(20).refine(val => !val || /^[0-9]+$/.test(val), 'Postal Code must contain only numbers').optional().nullable(),
    addressLine1: z.string().max(200).optional().nullable().or(z.literal('')),
    addressLine2: z.string().max(200).optional().nullable().or(z.literal('')),
    billingAddress: z.string().max(500).optional().nullable().or(z.literal('')),
    shippingAddress: z.string().max(500).optional().nullable().or(z.literal('')),
    status: z.enum(['Prospect', 'Customer', 'Partner', 'Vendor', 'Supplier', 'Distributor', 'Inactive', 'Archived']).optional(),
    priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
    rating: z.number().int().min(0).max(5).optional(),
    ownerId: z.string().uuid('Invalid owner ID').optional().nullable().or(z.literal('')),
    parentCompanyId: z.string().uuid('Invalid parent company ID').optional().nullable().or(z.literal('')),
    description: z.string().max(5000).optional().nullable().or(z.literal('')),
    tags: z.array(z.string()).optional(),
  }),
  params: z.object({ id: z.string().uuid('Invalid company ID') }),
  query: z.object({}).optional(),
});

export const updateStatusSchema = z.object({
  body: z.object({
    ids: z.array(z.string().uuid()).min(1, 'At least one company ID is required'),
    status: z.enum(['Prospect', 'Customer', 'Partner', 'Vendor', 'Supplier', 'Distributor', 'Inactive', 'Archived']),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const updateOwnerSchema = z.object({
  body: z.object({
    ids: z.array(z.string().uuid()).min(1, 'At least one company ID is required'),
    ownerId: z.string().uuid('Invalid owner ID'),
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional(),
});

export const listCompaniesSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({}).optional(),
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
    status: z.string().optional(),
    industry: z.string().optional(),
    country: z.string().optional(),
    state: z.string().optional(),
    owner: z.string().optional(),
    priority: z.string().optional(),
    rating: z.string().optional(),
    minRevenue: z.string().optional(),
    maxRevenue: z.string().optional(),
    minEmployees: z.string().optional(),
    maxEmployees: z.string().optional(),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    sortBy: z.string().optional(),
    sortDir: z.string().optional(),
    myCompaniesOnly: z.string().optional(),
    customersOnly: z.string().optional(),
    partnersOnly: z.string().optional(),
    prospectsOnly: z.string().optional(),
    recentlyAdded: z.string().optional(),
    highRevenue: z.string().optional(),
    highPriority: z.string().optional(),
    archivedOnly: z.string().optional(),
  }).passthrough().optional(),
});

export const getCompanyByIdSchema = z.object({
  body: z.any().optional(),
  params: z.object({ id: z.string().uuid('Invalid company ID') }),
  query: z.any().optional(),
});
