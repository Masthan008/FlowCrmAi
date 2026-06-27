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

export interface ContactNote {
  id: string;
  contactId: string;
  content: string;
  isPinned: boolean;
  title: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactActivity {
  id: string;
  contactId: string;
  type: string;
  title: string;
  description: string | null;
  activityDate: string;
  status: string;
  priority: string;
  isCompleted: boolean;
  assignedToId: string | null;
  assignedTo?: { id: string; firstName: string; lastName: string; email: string } | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactFile {
  id: string;
  contactId: string;
  name: string;
  path: string;
  mimeType: string;
  size: number;
  createdBy?: string | null;
  createdAt: string;
}

export interface ContactTimeline {
  id: string;
  contactId: string;
  type: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  eventDate: string;
  createdBy?: string | null;
}

export interface ContactHistory {
  id: string;
  contactId: string;
  action: string;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  userId: string | null;
  createdAt: string;
}

export interface ContactEmail {
  id: string;
  subject: string;
  sender: string;
  recipient: string;
  status: 'Sent' | 'Delivered' | 'Failed' | 'Draft';
  sentDate: string;
  hasAttachments: boolean;
  previewText: string;
}

export interface ContactRelationship {
  id: string;
  contactId: string;
  relatedContactId: string | null;
  relatedCompanyId: string | null;
  role: string;
  joiningDate: string | null;
  leavingDate: string | null;
  position: string | null;
  department: string | null;
  reportingManager: string | null;
  businessUnit: string | null;
  createdAt?: string;
}

export interface ContactCall {
  id: string;
  contactId: string;
  direction: string;
  duration: number;
  outcome: string;
  notes: string | null;
  nextFollowUp: string | null;
  recordingPath: string | null;
  createdAt: string;
}

export interface ContactEmailLog {
  id: string;
  contactId: string;
  subject: string;
  sender: string;
  recipient: string;
  cc: string | null;
  bcc: string | null;
  body: string | null;
  status: string;
  deliveryStatus: string | null;
  openStatus: boolean;
  hasAttachments: boolean;
  createdAt: string;
}

export interface ContactWhatsAppLog {
  id: string;
  contactId: string;
  direction: string;
  message: string;
  mediaPath: string | null;
  status: string;
  timestamp: string;
}

export interface ContactMeetingLog {
  id: string;
  contactId: string;
  title: string;
  agenda: string | null;
  minutes: string | null;
  outcome: string | null;
  followUp: string | null;
  meetingDate: string;
  duration: number;
  location: string | null;
  status: string;
  participants: string[];
  createdAt: string;
}

export interface ContactBusinessMetric {
  id: string;
  contactId: string;
  totalRevenue: number;
  dealsClosed: number;
  invoicesCount: number;
  paymentsCount: number;
  averageDealSize: number;
  lifetimeValue: number;
  currentOpportunityVal: number;
}

export interface ContactHealth {
  id: string;
  contactId: string;
  communicationFreq: number;
  activityLevel: number;
  meetingFreq: number;
  responseTime: number;
  dealProgress: number;
  revenueScore: number;
  overallHealth: 'Green' | 'Yellow' | 'Red';
}

export interface ContactEngagement {
  id: string;
  contactId: string;
  emailActivityScore: number;
  callActivityScore: number;
  meetingScore: number;
  taskScore: number;
  followUpScore: number;
  overallScore: number;
}

export interface JourneyEvent {
  stage: string;
  date: string | null;
  desc: string;
  completed: boolean;
}

export interface ContactLifecycle {
  id: string;
  contactId: string;
  currentStage: string;
  previousStage: string | null;
  lastStageChange: string;
  durationInStage: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContactStageHistory {
  id: string;
  contactId: string;
  fromStage: string | null;
  toStage: string;
  transitionDate: string;
  reason: string | null;
  changedBy: string | null;
}

export interface ContactPreference {
  id: string;
  contactId: string;
  preferredChannel: string;
  preferredTime: string | null;
  language: string;
  timezone: string;
  emailPreference: boolean;
  smsPreference: boolean;
  whatsappPreference: boolean;
  phonePreference: boolean;
  marketingConsent: boolean;
  newsletterConsent: boolean;
  gdprConsent: boolean;
  favoriteProduct: string | null;
  favoriteCategory: string | null;
  buyingFrequency: string | null;
  businessSize: string | null;
  customerType: string | null;
  industry: string | null;
  budgetRange: string | null;
  annualRevenue: number | null;
  decisionAuthority: string | null;
  relationshipType: string | null;
}

export interface ContactTag {
  id: string;
  name: string;
  color: string;
  type: string;
}

export interface ContactTagMapping {
  id: string;
  contactId: string;
  tagId: string;
  tag?: ContactTag;
}

export interface ContactSegmentRule {
  id: string;
  segmentId: string;
  field: string;
  operator: string;
  value: string;
  logicalOperator: string;
}

export interface ContactSegment {
  id: string;
  name: string;
  description: string | null;
  rules: ContactSegmentRule[];
}

export interface ContactWorkflow {
  id: string;
  name: string;
  triggerType: string;
  conditions: any;
  actions: any;
  isActive: boolean;
}

export interface ContactFollowUp {
  id: string;
  contactId: string;
  type: string;
  date: string;
  time: string | null;
  priority: string;
  reminderActive: boolean;
  reminderDate: string | null;
  status: string;
  outcome: string | null;
  nextFollowUpDate: string | null;
  ownerId: string | null;
  notes?: string;
}

export interface ContactScore {
  id: string;
  contactId: string;
  communicationFreq: number;
  meetingFreq: number;
  businessValue: number;
  revenueScore: number;
  responseTimeScore: number;
  overallScore: number;
}

export interface ContactRisk {
  id: string;
  contactId: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  riskFactors: string[];
}

export interface ContactRecommendation {
  id: string;
  contactId: string;
  type: string;
  suggestionText: string;
  priority: string;
  bestContactTime: string | null;
}


