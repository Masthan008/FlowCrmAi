export interface Contact {
  id: string;
  contactNumber: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  fullName: string;
  profilePhoto?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  jobTitle?: string | null;
  department?: string | null;
  companyId?: string | null;
  company?: {
    id: string;
    name: string;
    domain?: string | null;
    phone?: string | null;
    industry?: string | null;
    status: string;
  } | null;
  leadId?: string | null;
  lead?: {
    id: string;
    leadNumber: string;
    firstName: string;
    lastName: string;
    fullName: string;
  } | null;
  customerId?: string | null;
  customer?: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    type: string;
    status: string;
  } | null;
  email?: string | null;
  secondaryEmail?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  whatsApp?: string | null;
  website?: string | null;
  linkedin?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  postalCode?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  status: string;
  ownerId?: string | null;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  preferredLanguage?: string | null;
  preferredContactMethod?: string | null;
  timezone?: string | null;
  tags: string[];
  description?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ContactFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  profilePhoto?: string;
  gender?: string;
  dateOfBirth?: string;
  jobTitle?: string;
  department?: string;
  companyId?: string;
  leadId?: string;
  customerId?: string;
  email?: string;
  secondaryEmail?: string;
  phone?: string;
  alternatePhone?: string;
  whatsApp?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
  country?: string;
  state?: string;
  city?: string;
  postalCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  status?: string;
  ownerId?: string;
  preferredLanguage?: string;
  preferredContactMethod?: string;
  timezone?: string;
  tags?: string[];
  description?: string;
}

export interface ContactStatistics {
  totalContacts: number;
  activeContacts: number;
  vipContacts: number;
  customerContacts: number;
  partnerContacts: number;
  recentlyAdded: number;
}

export interface ContactFilters {
  search?: string;
  status?: string;
  owner?: string;
  vip?: boolean;
  recentlyAdded?: boolean;
  customerOnly?: boolean;
  partnerOnly?: boolean;
  inactiveOnly?: boolean;
  archivedOnly?: boolean;
  myContactsOnly?: boolean;
  companyId?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface ContactPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}
