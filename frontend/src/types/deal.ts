export interface Deal {
  id: string;
  dealNumber: string;
  name: string;
  opportunityName?: string;
  customerId: string;
  customer?: { id: string; name: string; email?: string; phone?: string };
  companyId?: string;
  company?: { id: string; name: string; companyNumber: string; industry?: string };
  primaryContactId?: string;
  primaryContact?: { id: string; fullName: string; email?: string; phone?: string };
  leadId?: string;
  lead?: { id: string; leadNumber: string; fullName: string };
  pipelineId?: string;
  pipeline?: { id: string; name: string };
  stageId: string;
  stage?: { id: string; name: string; order: number; probability: number };
  assignedToId?: string;
  assignedTo?: { id: string; firstName: string; lastName: string; email: string };
  status: string;
  priority: string;
  probability: number;
  value: number;
  expectedRevenue: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  currency: string;
  source?: string;
  industry?: string;
  businessType?: string;
  description?: string;
  tags: string[];
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  version: number;
}

export interface DealFormData {
  name: string;
  opportunityName?: string;
  customerId: string;
  companyId?: string;
  primaryContactId?: string;
  leadId?: string;
  pipelineId?: string;
  stageId: string;
  assignedToId?: string;
  status?: string;
  priority?: string;
  probability?: number;
  value?: number;
  expectedRevenue?: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  currency?: string;
  source?: string;
  industry?: string;
  businessType?: string;
  description?: string;
  tags?: string[];
}

export interface DealFilters {
  search?: string;
  status?: string;
  pipelineId?: string;
  stageId?: string;
  ownerId?: string;
  priority?: string;
  source?: string;
  industry?: string;
  companyId?: string;
  valueMin?: number;
  valueMax?: number;
  probabilityMin?: number;
  probabilityMax?: number;
  closeDateFrom?: string;
  closeDateTo?: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: string;
  sortDir?: string;
  myDeals?: boolean;
  open?: boolean;
  won?: boolean;
  lost?: boolean;
  closingThisMonth?: boolean;
  highProbability?: boolean;
  highValue?: boolean;
  recentlyCreated?: boolean;
}

export interface DealPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface DealStatistics {
  totalDeals: number;
  openDeals: number;
  wonDeals: number;
  lostDeals: number;
  pipelineValue: number;
  wonRevenue: number;
  averageDealValue: number;
  averageProbability: number;
}
