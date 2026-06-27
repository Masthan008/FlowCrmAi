export interface Company {
  id: string;
  companyNumber: string;
  name: string;
  legalName?: string;
  displayName?: string;
  logo?: string;
  companyType?: string;
  industry?: string;
  subIndustry?: string;
  businessCategory?: string;
  website?: string;
  primaryEmail?: string;
  secondaryEmail?: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  whatsApp?: string;
  gstNumber?: string;
  taxNumber?: string;
  registrationNumber?: string;
  panNumber?: string;
  foundedYear?: number;
  annualRevenue?: number;
  employeeCount?: number;
  ownershipType?: string;
  currency?: string;
  timezone?: string;
  primaryLanguage?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  billingAddress?: string;
  shippingAddress?: string;
  status: string;
  priority: string;
  rating: number;
  ownerId?: string;
  owner?: { id: string; firstName: string; lastName: string; email: string };
  parentCompanyId?: string;
  parentCompany?: { id: string; name: string; companyNumber: string };
  description?: string;
  tags: string[];
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  version: number;
}

export interface CompanyFormData {
  name: string;
  legalName?: string;
  displayName?: string;
  logo?: string;
  companyType?: string;
  industry?: string;
  subIndustry?: string;
  businessCategory?: string;
  website?: string;
  primaryEmail?: string;
  secondaryEmail?: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  whatsApp?: string;
  gstNumber?: string;
  taxNumber?: string;
  registrationNumber?: string;
  panNumber?: string;
  foundedYear?: number | null;
  annualRevenue?: number | null;
  employeeCount?: number | null;
  ownershipType?: string;
  currency?: string;
  timezone?: string;
  primaryLanguage?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  billingAddress?: string;
  shippingAddress?: string;
  status?: string;
  priority?: string;
  rating?: number;
  ownerId?: string;
  parentCompanyId?: string;
  description?: string;
  tags?: string[];
}

export interface CompanyFilters {
  search?: string;
  status?: string;
  industry?: string;
  country?: string;
  state?: string;
  owner?: string;
  priority?: string;
  rating?: string;
  minRevenue?: string;
  maxRevenue?: string;
  minEmployees?: string;
  maxEmployees?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortDir?: string;
  myCompaniesOnly?: boolean;
  customersOnly?: boolean;
  partnersOnly?: boolean;
  prospectsOnly?: boolean;
  recentlyAdded?: boolean;
  highRevenue?: boolean;
  highPriority?: boolean;
  archivedOnly?: boolean;
}

export interface CompanyPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface CompanyStatistics {
  total: number;
  customers: number;
  partners: number;
  prospects: number;
  highRevenue: number;
  active: number;
  inactive: number;
}

export const COMPANY_STATUSES = [
  'Prospect', 'Customer', 'Partner', 'Vendor', 'Supplier', 'Distributor', 'Inactive', 'Archived'
] as const;

export const COMPANY_TYPES = [
  'Private Limited', 'Public Limited', 'Government', 'Startup', 'Enterprise',
  'NGO', 'Educational', 'Healthcare', 'Manufacturing', 'Retail', 'Technology', 'Finance', 'Custom'
] as const;

export const COMPANY_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const;
