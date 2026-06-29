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

// Company 360 Workspace Types
export interface CompanyNote {
  id: string;
  companyId: string;
  content: string;
  isPinned: boolean;
  title?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CompanyActivity {
  id: string;
  companyId: string;
  type: string;
  title: string;
  description?: string;
  activityDate: string;
  status: string;
  priority: string;
  isCompleted: boolean;
  assignedToId?: string;
  assignedTo?: { id: string; firstName: string; lastName: string; email: string };
  createdBy?: string;
  createdAt: string;
}

export interface CompanyFile {
  id: string;
  companyId: string;
  name: string;
  path: string;
  mimeType: string;
  size: number;
  createdBy?: string;
  createdAt: string;
}

export interface CompanyTimelineEvent {
  id: string;
  companyId: string;
  type: string;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  eventDate: string;
  createdBy?: string;
  createdAt: string;
}

export interface CompanyHistoryEntry {
  id: string;
  companyId: string;
  action: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  userId?: string;
  createdBy?: string;
  createdAt: string;
}

// Company Phase 6 - Enterprise Relationship Management
export interface CompanyBranch {
  id: string;
  companyId: string;
  name: string;
  branchCode?: string;
  branchType?: string;
  managerId?: string;
  phone?: string;
  email?: string;
  address?: string;
  gst?: string;
  country?: string;
  state?: string;
  city?: string;
  employeeCount: number;
  revenue: number;
  status: string;
  openingDate?: string;
  timezone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyDepartment {
  id: string;
  companyId: string;
  name: string;
  type: string;
  managerId?: string;
  description?: string;
  revenue: number;
  status: string;
  employeeCount: number;
  createdAt: string;
}

export interface CompanyHierarchyEntry {
  id: string;
  companyId: string;
  parentCompanyId?: string;
  parentCompany?: { id: string; name: string; companyNumber: string; status: string };
  relationshipType: string;
  level: number;
  description?: string;
  children?: CompanyHierarchyEntry[];
  createdAt: string;
}

export interface CompanyBusinessNetworkEntry {
  id: string;
  companyId: string;
  relatedCompanyId?: string;
  name: string;
  relationshipType: string;
  description?: string;
  status: string;
  website?: string;
  createdAt: string;
}

export interface CompanyRevenueEntry {
  id: string;
  companyId: string;
  period: string;
  year: number;
  month?: number;
  quarter?: number;
  amount: number;
  type: string;
  description?: string;
  createdAt: string;
}

export interface CompanyRevenueSummary {
  totalRevenue: number;
  annualRevenue: number;
  monthlyRevenue: number;
  quarterlyRevenue: number;
  currentYear: number;
  currentMonth: number;
  annualCount: number;
  monthlyCount: number;
}

export interface CompanyCustomerJourneyEntry {
  id: string;
  companyId: string;
  type: string;
  title: string;
  description?: string;
  eventDate: string;
  icon?: string;
  color?: string;
  metadata?: string;
  createdAt: string;
}

export interface CompanyRevenueDashboard {
  totalSales: number;
  averageDealValue: number;
  outstandingAmount: number;
  paidAmount: number;
  pipelineValue: number;
  dealCount: number;
  invoiceCount: number;
  paymentCount: number;
}

export interface CompanyBusinessNetworkGrouped {
  [key: string]: CompanyBusinessNetworkEntry[];
}

// Phase 6: Enterprise Company Intelligence
export interface CompanyLifecycle {
  id: string;
  companyId: string;
  currentStage: string;
  previousStage: string | null;
  enteredStageAt: string;
  duration: number;
  lastTransition: string;
  transitionCount: number;
}

export interface CompanyStageHistory {
  id: string;
  companyId: string;
  fromStage: string | null;
  toStage: string;
  changedBy: string | null;
  changeReason: string | null;
  durationInStage: number | null;
  createdAt: string;
}

export interface CompanyScore {
  id: string;
  companyId: string;
  overallScore: number;
  revenueScore: number;
  dealValueScore: number;
  engagementScore: number;
  meetingScore: number;
  taskScore: number;
  communicationScore: number;
  lifetimeScore: number;
  lastCalculatedAt: string;
}

export interface CompanyHealth {
  id: string;
  companyId: string;
  overallHealth: number;
  healthStatus: string;
  communicationHealth: number;
  dealSuccessHealth: number;
  revenueGrowthHealth: number;
  meetingHealth: number;
  satisfactionHealth: number;
  supportHealth: number;
  paymentHealth: number;
  activityHealth: number;
  lastCalculatedAt: string;
}

export interface CompanyRisk {
  id: string;
  companyId: string;
  overallRisk: number;
  riskLevel: string;
  inactiveDaysRisk: number;
  lostDealsRisk: number;
  pendingPaymentsRisk: number;
  noMeetingsRisk: number;
  lowEngagementRisk: number;
  revenueDeclineRisk: number;
  expiredContractsRisk: number;
  riskReasons: string[];
  lastCalculatedAt: string;
}

export interface CompanySegment {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  isDynamic: boolean;
  matchType: string;
  isActive: boolean;
  companyCount: number;
  rules: CompanySegmentRule[];
  createdAt: string;
}

export interface CompanySegmentRule {
  id: string;
  segmentId: string;
  field: string;
  operator: string;
  value: string;
  value2: string | null;
  logicGroup: string | null;
}

export interface CompanyTag {
  id: string;
  name: string;
  color: string | null;
  description: string | null;
  isActive: boolean;
  usageCount: number;
}

export interface CompanyTagMapping {
  id: string;
  companyId: string;
  tagId: string;
  tag: CompanyTag;
  assignedAt: string;
}

export interface CompanyWorkflow {
  id: string;
  companyId: string | null;
  name: string;
  description: string | null;
  triggerType: string;
  triggerConfig: any;
  conditions: any[];
  actions: any[];
  isActive: boolean;
  isTemplate: boolean;
  runCount: number;
  lastRunAt: string | null;
  createdAt: string;
}

export interface CompanyRecommendation {
  id: string;
  companyId: string;
  type: string;
  title: string;
  description: string | null;
  priority: string;
  confidence: number;
  isRead: boolean;
  isActioned: boolean;
  actionedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface CompanyFollowup {
  id: string;
  companyId: string;
  type: string;
  title: string;
  description: string | null;
  ownerId: string | null;
  owner: { id: string; firstName: string; lastName: string; email: string } | null;
  dueDate: string;
  priority: string;
  status: string;
  reminderDate: string | null;
  reminderSent: boolean;
  completedAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface BusinessInsights {
  highestRevenueCompany: { name: string; annualRevenue: number } | null;
  fastestGrowingCompany: { name: string; revenueGrowth: number } | null;
  mostActiveCompany: { name: string; activityCount: number } | null;
  highestLifetimeValue: { name: string; lifetimeValue: number } | null;
  mostMeetings: { name: string; meetingCount: number } | null;
  mostDeals: { name: string; dealCount: number } | null;
  mostContacts: { name: string; contactCount: number } | null;
  highestPipelineValue: { name: string; pipelineValue: number } | null;
}

export interface CompanyAnalytics {
  revenueTrend: { month: string; revenue: number }[];
  growthTrend: { month: string; growth: number }[];
  industryDistribution: { industry: string; count: number }[];
  lifecycleDistribution: { stage: string; count: number }[];
  customerDistribution: { type: string; count: number }[];
  geographicalDistribution: { country: string; count: number }[];
}
