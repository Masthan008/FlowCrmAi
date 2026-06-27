/**
 * Lead Source master data
 */
export interface LeadSource {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

/**
 * Lead Status master data
 */
export interface LeadStatus {
  id: string;
  name: string;
  description?: string;
  color: string;
  order: number;
  isActive: boolean;
}

/**
 * Lead entity
 */
export interface Lead {
  id: string;
  leadNumber: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  jobTitle?: string | null;
  companyName?: string | null;
  industry?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  sourceId?: string | null;
  source?: { id: string; name: string } | null;
  statusId?: string | null;
  status?: { id: string; name: string; color: string; order: number } | null;
  assignedToId?: string | null;
  assignedTo?: { id: string; firstName: string; lastName: string; email: string } | null;
  priority: string;
  rating: number;
  value: number;
  expectedClosingDate?: string | null;
  description?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/**
 * Lead form data (create / edit)
 */
export interface LeadFormData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  companyName?: string;
  jobTitle?: string;
  industry?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  sourceId?: string;
  statusId?: string;
  assignedToId?: string;
  priority?: string;
  rating?: number;
  value?: number;
  expectedClosingDate?: string;
  description?: string;
}

/**
 * Lead statistics
 */
export interface LeadStatistics {
  totalLeads: number;
  qualifiedLeads: number;
  wonLeads: number;
  lostLeads: number;
  conversionRate: number;
  averageValue: number;
  totalValue: number;
}

/**
 * Lead list filters
 */
export interface LeadFilters {
  search?: string;
  status?: string;
  source?: string;
  priority?: string;
  owner?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/**
 * Pagination info
 */
export interface LeadPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}
