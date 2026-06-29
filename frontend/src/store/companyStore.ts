import { create } from 'zustand';
import { companyApi } from '../services/companyApi';
import { api } from '../services/api';
import type {
  Company, CompanyFilters, CompanyStatistics, CompanyPagination, CompanyFormData,
  CompanyNote, CompanyActivity, CompanyFile, CompanyTimelineEvent, CompanyHistoryEntry,
  CompanyBranch, CompanyDepartment, CompanyHierarchyEntry, CompanyBusinessNetworkEntry,
  CompanyRevenueEntry, CompanyRevenueSummary, CompanyRevenueDashboard,
  CompanyCustomerJourneyEntry, CompanyBusinessNetworkGrouped,
  CompanyLifecycle, CompanyStageHistory, CompanyScore, CompanyHealth, CompanyRisk,
  CompanySegment, CompanyTag, CompanyTagMapping, CompanyWorkflow,
  CompanyRecommendation, CompanyFollowup, BusinessInsights, CompanyAnalytics,
} from '../types/company';

const COMPANIES_URL = '/companies';

interface CompanyState {
  companies: Company[];
  currentCompany: Company | null;
  statistics: CompanyStatistics | null;
  employees: { id: string; firstName: string; lastName: string; email: string }[];
  loading: boolean;
  error: string | null;
  filters: CompanyFilters;
  pagination: CompanyPagination;
  selectedIds: string[];

  timeline: CompanyTimelineEvent[];
  activities: CompanyActivity[];
  notes: CompanyNote[];
  files: CompanyFile[];
  history: CompanyHistoryEntry[];

  // Phase 6
  hierarchy: CompanyHierarchyEntry[];
  branches: CompanyBranch[];
  departments: CompanyDepartment[];
  contacts: any[];
  leads: any[];
  deals: any[];
  quotes: any[];
  invoices: any[];
  payments: any[];
  revenue: CompanyRevenueEntry[];
  revenueSummary: CompanyRevenueSummary | null;
  revenueDashboard: CompanyRevenueDashboard | null;
  businessNetwork: CompanyBusinessNetworkEntry[];
  businessNetworkGrouped: CompanyBusinessNetworkGrouped;
  journey: CompanyCustomerJourneyEntry[];

  fetchCompanies: () => Promise<void>;
  fetchCompany: (id: string) => Promise<void>;
  createCompany: (data: CompanyFormData) => Promise<Company>;
  updateCompany: (id: string, data: Partial<CompanyFormData>) => Promise<Company>;
  deleteCompany: (id: string) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  fetchEmployees: () => Promise<void>;
  setFilters: (filters: Partial<CompanyFilters>) => void;
  setPage: (page: number) => void;
  toggleSelection: (id: string) => void;
  toggleAllSelection: () => void;
  clearSelection: () => void;
  clearCurrentCompany: () => void;
  clearError: () => void;
  bulkUpdateStatus: (ids: string[], status: string) => Promise<void>;
  bulkUpdateOwner: (ids: string[], ownerId: string) => Promise<void>;

  // 360 Workspace
  fetchTimeline: (id: string, params?: any) => Promise<void>;
  fetchActivities: (id: string, params?: any) => Promise<void>;
  createActivity: (id: string, data: any) => Promise<void>;
  updateActivity: (id: string, activityId: string, data: any) => Promise<void>;
  deleteActivity: (id: string, activityId: string) => Promise<void>;
  fetchNotes: (id: string) => Promise<void>;
  createNote: (id: string, data: any) => Promise<void>;
  updateNote: (id: string, noteId: string, data: any) => Promise<void>;
  deleteNote: (id: string, noteId: string) => Promise<void>;
  fetchFiles: (id: string) => Promise<void>;
  uploadFile: (id: string, data: any) => Promise<void>;
  deleteFile: (id: string, fileId: string) => Promise<void>;
  fetchHistory: (id: string, params?: any) => Promise<void>;

  // Phase 6: Hierarchy
  fetchHierarchy: (id: string) => Promise<void>;
  createHierarchyEntry: (id: string, data: any) => Promise<void>;
  deleteHierarchyEntry: (id: string, entryId: string) => Promise<void>;

  // Phase 6: Branches
  fetchBranches: (id: string) => Promise<void>;
  createBranch: (id: string, data: any) => Promise<void>;
  updateBranch: (id: string, branchId: string, data: any) => Promise<void>;
  deleteBranch: (id: string, branchId: string) => Promise<void>;

  // Phase 6: Departments
  fetchDepartments: (id: string) => Promise<void>;
  createDepartment: (id: string, data: any) => Promise<void>;
  updateDepartment: (id: string, deptId: string, data: any) => Promise<void>;
  deleteDepartment: (id: string, deptId: string) => Promise<void>;

  // Phase 6: Related Data
  fetchContacts: (id: string) => Promise<void>;
  fetchLeads: (id: string) => Promise<void>;
  fetchDeals: (id: string) => Promise<void>;
  fetchQuotes: (id: string) => Promise<void>;
  fetchInvoices: (id: string) => Promise<void>;
  fetchPayments: (id: string) => Promise<void>;

  // Phase 6: Revenue
  fetchRevenue: (id: string) => Promise<void>;
  fetchRevenueSummary: (id: string) => Promise<void>;
  fetchRevenueDashboard: (id: string) => Promise<void>;
  createRevenueEntry: (id: string, data: any) => Promise<void>;
  deleteRevenueEntry: (id: string, entryId: string) => Promise<void>;

  // Phase 6: Business Network
  fetchBusinessNetwork: (id: string) => Promise<void>;
  fetchBusinessNetworkGrouped: (id: string) => Promise<void>;
  createBusinessNetworkEntry: (id: string, data: any) => Promise<void>;
  updateBusinessNetworkEntry: (id: string, entryId: string, data: any) => Promise<void>;
  deleteBusinessNetworkEntry: (id: string, entryId: string) => Promise<void>;

  // Phase 6: Customer Journey
  fetchJourney: (id: string) => Promise<void>;
  createJourneyEntry: (id: string, data: any) => Promise<void>;
  deleteJourneyEntry: (id: string, entryId: string) => Promise<void>;

  // Phase 6: Enterprise Company Intelligence
  lifecycle: CompanyLifecycle | null;
  stageHistory: CompanyStageHistory[];
  score: CompanyScore | null;
  health: CompanyHealth | null;
  risk: CompanyRisk | null;
  segments: CompanySegment[];
  tags: CompanyTag[];
  companyTags: CompanyTagMapping[];
  workflows: CompanyWorkflow[];
  recommendations: CompanyRecommendation[];
  followups: CompanyFollowup[];
  insights: BusinessInsights | null;
  analytics: CompanyAnalytics | null;

  fetchLifecycle: (id: string) => Promise<void>;
  updateLifecycle: (id: string, data: any) => Promise<void>;
  fetchStageHistory: (id: string) => Promise<void>;
  fetchScore: (id: string) => Promise<void>;
  calculateScore: (id: string) => Promise<void>;
  fetchHealth: (id: string) => Promise<void>;
  calculateHealth: (id: string) => Promise<void>;
  fetchRisk: (id: string) => Promise<void>;
  calculateRisk: (id: string) => Promise<void>;
  fetchSegments: (params?: any) => Promise<void>;
  createSegment: (data: any) => Promise<void>;
  updateSegment: (id: string, data: any) => Promise<void>;
  deleteSegment: (id: string) => Promise<void>;
  evaluateSegment: (id: string) => Promise<void>;
  fetchTags: (params?: any) => Promise<void>;
  createTag: (data: any) => Promise<void>;
  updateTag: (id: string, data: any) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  fetchCompanyTags: (id: string) => Promise<void>;
  assignTags: (id: string, tagIds: string[]) => Promise<void>;
  removeTag: (companyId: string, tagId: string) => Promise<void>;
  fetchWorkflows: (params?: any) => Promise<void>;
  createWorkflow: (data: any) => Promise<void>;
  updateWorkflow: (id: string, data: any) => Promise<void>;
  deleteWorkflow: (id: string) => Promise<void>;
  fetchRecommendations: (id: string) => Promise<void>;
  createRecommendation: (id: string, data: any) => Promise<void>;
  fetchFollowups: (id: string, params?: any) => Promise<void>;
  createFollowup: (id: string, data: any) => Promise<void>;
  updateFollowup: (id: string, followupId: string, data: any) => Promise<void>;
  deleteFollowup: (id: string, followupId: string) => Promise<void>;
  fetchInsights: () => Promise<void>;
  fetchAnalytics: (params?: any) => Promise<void>;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],
  currentCompany: null,
  statistics: null,
  employees: [],
  loading: false,
  error: null,
  filters: {},
  pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 0 },
  selectedIds: [],
  timeline: [],
  activities: [],
  notes: [],
  files: [],
  history: [],
  // Phase 6
  hierarchy: [],
  branches: [],
  departments: [],
  contacts: [],
  leads: [],
  deals: [],
  quotes: [],
  invoices: [],
  payments: [],
  revenue: [],
  revenueSummary: null,
  revenueDashboard: null,
  businessNetwork: [],
  businessNetworkGrouped: {},
  journey: [],

  // Phase 6: Intelligence
  lifecycle: null,
  stageHistory: [],
  score: null,
  health: null,
  risk: null,
  segments: [],
  tags: [],
  companyTags: [],
  workflows: [],
  recommendations: [],
  followups: [],
  insights: null,
  analytics: null,

  fetchCompanies: async () => {
    set({ loading: true, error: null });
    try {
      const { filters, pagination } = get();
      const params: any = { ...filters, page: pagination.page, limit: pagination.limit };
      
      // Clean undefined, null, or empty string values from params
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === null || params[key] === '') {
          delete params[key];
        }
      });

      const res = await companyApi.getCompanies(params);
      set({ companies: res.data.data, pagination: res.data.pagination, loading: false });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to fetch companies', loading: false });
    }
  },

  fetchCompany: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await companyApi.getCompany(id);
      set({ currentCompany: res.data.data, loading: false });
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Failed to fetch company', loading: false });
    }
  },

  createCompany: async (data: CompanyFormData) => {
    const res = await companyApi.createCompany(data);
    return res.data.data;
  },

  updateCompany: async (id: string, data: Partial<CompanyFormData>) => {
    const res = await companyApi.updateCompany(id, data);
    return res.data.data;
  },

  deleteCompany: async (id: string) => {
    await companyApi.deleteCompany(id);
    set((state) => ({
      companies: state.companies.filter((c) => c.id !== id),
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
    }));
  },

  fetchStatistics: async () => {
    try { const res = await companyApi.getStatistics(); set({ statistics: res.data.data }); } catch (_) {}
  },

  fetchEmployees: async () => {
    try { const res = await companyApi.getEmployees(); set({ employees: res.data.data }); } catch (_) {}
  },

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters }, pagination: { ...state.pagination, page: 1 } }));
  },

  setPage: (page) => set((state) => ({ pagination: { ...state.pagination, page } })),
  toggleSelection: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id) ? state.selectedIds.filter((sid) => sid !== id) : [...state.selectedIds, id],
  })),
  toggleAllSelection: () => set((state) => ({
    selectedIds: state.selectedIds.length === state.companies.length ? [] : state.companies.map((c) => c.id),
  })),
  clearSelection: () => set({ selectedIds: [] }),
  clearCurrentCompany: () => set({
    currentCompany: null, timeline: [], activities: [], notes: [], files: [], history: [],
    hierarchy: [], branches: [], departments: [], contacts: [], leads: [], deals: [],
    quotes: [], invoices: [], payments: [], revenue: [], revenueSummary: null,
    revenueDashboard: null, businessNetwork: [], businessNetworkGrouped: {}, journey: [],
    lifecycle: null, stageHistory: [], score: null, health: null, risk: null,
    segments: [], tags: [], companyTags: [], workflows: [], recommendations: [], followups: [],
    insights: null, analytics: null,
  }),
  clearError: () => set({ error: null }),

  bulkUpdateStatus: async (ids, status) => { await companyApi.bulkUpdateStatus(ids, status); get().fetchCompanies(); },
  bulkUpdateOwner: async (ids, ownerId) => { await companyApi.bulkUpdateOwner(ids, ownerId); get().fetchCompanies(); },

  fetchTimeline: async (id, params) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/timeline`, { params }); set({ timeline: res.data.data }); } catch (_) {}
  },

  fetchActivities: async (id, params) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/activities`, { params }); set({ activities: res.data.data }); } catch (_) {}
  },

  createActivity: async (id, data) => {
    await api.post(`${COMPANIES_URL}/${id}/activities`, data); get().fetchActivities(id);
  },

  updateActivity: async (id, activityId, data) => {
    await api.put(`${COMPANIES_URL}/${id}/activities/${activityId}`, data); get().fetchActivities(id);
  },

  deleteActivity: async (id, activityId) => {
    await api.delete(`${COMPANIES_URL}/${id}/activities/${activityId}`); get().fetchActivities(id);
  },

  fetchNotes: async (id) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/notes`); set({ notes: res.data.data }); } catch (_) {}
  },

  createNote: async (id, data) => {
    await api.post(`${COMPANIES_URL}/${id}/notes`, data); get().fetchNotes(id);
  },

  updateNote: async (id, noteId, data) => {
    await api.put(`${COMPANIES_URL}/${id}/notes/${noteId}`, data); get().fetchNotes(id);
  },

  deleteNote: async (id, noteId) => {
    await api.delete(`${COMPANIES_URL}/${id}/notes/${noteId}`); get().fetchNotes(id);
  },

  fetchFiles: async (id) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/files`); set({ files: res.data.data }); } catch (_) {}
  },

  uploadFile: async (id, data) => {
    await api.post(`${COMPANIES_URL}/${id}/files`, data); get().fetchFiles(id);
  },

  deleteFile: async (id, fileId) => {
    await api.delete(`${COMPANIES_URL}/${id}/files/${fileId}`); get().fetchFiles(id);
  },

  fetchHistory: async (id, params) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/history`, { params }); set({ history: res.data.data }); } catch (_) {}
  },

  // Phase 6: Hierarchy
  fetchHierarchy: async (id) => {
    try {
      const res = await api.get(`${COMPANIES_URL}/${id}/hierarchy/tree`);
      set({ hierarchy: res.data.data });
    } catch { try { const res = await api.get(`${COMPANIES_URL}/${id}/hierarchy`); set({ hierarchy: res.data.data }); } catch {} }
  },

  createHierarchyEntry: async (id, data) => {
    await api.post(`${COMPANIES_URL}/${id}/hierarchy`, data); get().fetchHierarchy(id);
  },

  deleteHierarchyEntry: async (id, entryId) => {
    await api.delete(`${COMPANIES_URL}/${id}/hierarchy/${entryId}`); get().fetchHierarchy(id);
  },

  // Phase 6: Branches
  fetchBranches: async (id) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/branches`); set({ branches: res.data.data }); } catch (_) {}
  },

  createBranch: async (id, data) => {
    await api.post(`${COMPANIES_URL}/${id}/branches`, data); get().fetchBranches(id);
  },

  updateBranch: async (id, branchId, data) => {
    await api.put(`${COMPANIES_URL}/${id}/branches/${branchId}`, data); get().fetchBranches(id);
  },

  deleteBranch: async (id, branchId) => {
    await api.delete(`${COMPANIES_URL}/${id}/branches/${branchId}`); get().fetchBranches(id);
  },

  // Phase 6: Departments
  fetchDepartments: async (id) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/departments`); set({ departments: res.data.data }); } catch (_) {}
  },

  createDepartment: async (id, data) => {
    await api.post(`${COMPANIES_URL}/${id}/departments`, data); get().fetchDepartments(id);
  },

  updateDepartment: async (id, deptId, data) => {
    await api.put(`${COMPANIES_URL}/${id}/departments/${deptId}`, data); get().fetchDepartments(id);
  },

  deleteDepartment: async (id, deptId) => {
    await api.delete(`${COMPANIES_URL}/${id}/departments/${deptId}`); get().fetchDepartments(id);
  },

  // Phase 6: Related Data
  fetchContacts: async (id) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/contacts`); set({ contacts: res.data.data }); } catch (_) {}
  },

  fetchLeads: async (id) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/leads`); set({ leads: res.data.data }); } catch (_) {}
  },

  fetchDeals: async (id) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/deals`); set({ deals: res.data.data }); } catch (_) {}
  },

  fetchQuotes: async (id) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/quotes`); set({ quotes: res.data.data }); } catch (_) {}
  },

  fetchInvoices: async (id) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/invoices`); set({ invoices: res.data.data }); } catch (_) {}
  },

  fetchPayments: async (id) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/payments`); set({ payments: res.data.data }); } catch (_) {}
  },

  // Phase 6: Revenue
  fetchRevenue: async (id) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/revenue`); set({ revenue: res.data.data }); } catch (_) {}
  },

  fetchRevenueSummary: async (id) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/revenue/summary`); set({ revenueSummary: res.data.data }); } catch (_) {}
  },

  fetchRevenueDashboard: async (id) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/revenue/dashboard`); set({ revenueDashboard: res.data.data }); } catch (_) {}
  },

  createRevenueEntry: async (id, data) => {
    await api.post(`${COMPANIES_URL}/${id}/revenue`, data); get().fetchRevenue(id); get().fetchRevenueSummary(id);
  },

  deleteRevenueEntry: async (id, entryId) => {
    await api.delete(`${COMPANIES_URL}/${id}/revenue/${entryId}`); get().fetchRevenue(id); get().fetchRevenueSummary(id);
  },

  // Phase 6: Business Network
  fetchBusinessNetwork: async (id) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/business-network`); set({ businessNetwork: res.data.data }); } catch (_) {}
  },

  fetchBusinessNetworkGrouped: async (id) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/business-network/grouped`); set({ businessNetworkGrouped: res.data.data }); } catch (_) {}
  },

  createBusinessNetworkEntry: async (id, data) => {
    await api.post(`${COMPANIES_URL}/${id}/business-network`, data); get().fetchBusinessNetwork(id); get().fetchBusinessNetworkGrouped(id);
  },

  updateBusinessNetworkEntry: async (id, entryId, data) => {
    await api.put(`${COMPANIES_URL}/${id}/business-network/${entryId}`, data); get().fetchBusinessNetwork(id); get().fetchBusinessNetworkGrouped(id);
  },

  deleteBusinessNetworkEntry: async (id, entryId) => {
    await api.delete(`${COMPANIES_URL}/${id}/business-network/${entryId}`); get().fetchBusinessNetwork(id); get().fetchBusinessNetworkGrouped(id);
  },

  // Phase 6: Customer Journey
  fetchJourney: async (id) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/customer-journey`); set({ journey: res.data.data }); } catch (_) {}
  },

  createJourneyEntry: async (id, data) => {
    await api.post(`${COMPANIES_URL}/${id}/customer-journey`, data); get().fetchJourney(id);
  },

  deleteJourneyEntry: async (id, entryId) => {
    await api.delete(`${COMPANIES_URL}/${id}/customer-journey/${entryId}`); get().fetchJourney(id);
  },

  // Phase 6: Enterprise Company Intelligence
  fetchLifecycle: async (id) => {
    try { const res = await companyApi.getLifecycle(id); set({ lifecycle: res.data.data }); } catch (_) {}
  },

  updateLifecycle: async (id, data) => {
    await companyApi.updateLifecycle(id, data); get().fetchLifecycle(id);
  },

  fetchStageHistory: async (id) => {
    try { const res = await companyApi.getStageHistory(id); set({ stageHistory: res.data.data }); } catch (_) {}
  },

  fetchScore: async (id) => {
    try { const res = await companyApi.getScore(id); set({ score: res.data.data }); } catch (_) {}
  },

  calculateScore: async (id) => {
    await companyApi.calculateScore(id); get().fetchScore(id);
  },

  fetchHealth: async (id) => {
    try { const res = await companyApi.getHealth(id); set({ health: res.data.data }); } catch (_) {}
  },

  calculateHealth: async (id) => {
    await companyApi.calculateHealth(id); get().fetchHealth(id);
  },

  fetchRisk: async (id) => {
    try { const res = await companyApi.getRisk(id); set({ risk: res.data.data }); } catch (_) {}
  },

  calculateRisk: async (id) => {
    await companyApi.calculateRisk(id); get().fetchRisk(id);
  },

  fetchSegments: async (params) => {
    try { const res = await companyApi.getSegments(params); set({ segments: res.data.data }); } catch (_) {}
  },

  createSegment: async (data) => {
    await companyApi.createSegment(data); get().fetchSegments();
  },

  updateSegment: async (id, data) => {
    await companyApi.updateSegment(id, data); get().fetchSegments();
  },

  deleteSegment: async (id) => {
    await companyApi.deleteSegment(id); get().fetchSegments();
  },

  evaluateSegment: async (id) => {
    await companyApi.evaluateSegment(id); get().fetchSegments();
  },

  fetchTags: async (params) => {
    try { const res = await companyApi.getTags(params); set({ tags: res.data.data }); } catch (_) {}
  },

  createTag: async (data) => {
    await companyApi.createTag(data); get().fetchTags();
  },

  updateTag: async (id, data) => {
    await companyApi.updateTag(id, data); get().fetchTags();
  },

  deleteTag: async (id) => {
    await companyApi.deleteTag(id); get().fetchTags();
  },

  fetchCompanyTags: async (id) => {
    try { const res = await companyApi.getCompanyTags(id); set({ companyTags: res.data.data }); } catch (_) {}
  },

  assignTags: async (id, tagIds) => {
    await companyApi.assignTags(id, { tagIds }); get().fetchCompanyTags(id);
  },

  removeTag: async (companyId, tagId) => {
    await companyApi.removeTag(companyId, tagId); get().fetchCompanyTags(companyId);
  },

  fetchWorkflows: async (params) => {
    try { const res = await companyApi.getWorkflows(params); set({ workflows: res.data.data }); } catch (_) {}
  },

  createWorkflow: async (data) => {
    await companyApi.createWorkflow(data); get().fetchWorkflows();
  },

  updateWorkflow: async (id, data) => {
    await companyApi.updateWorkflow(id, data); get().fetchWorkflows();
  },

  deleteWorkflow: async (id) => {
    await companyApi.deleteWorkflow(id); get().fetchWorkflows();
  },

  fetchRecommendations: async (id) => {
    try { const res = await companyApi.getRecommendations(id); set({ recommendations: res.data.data }); } catch (_) {}
  },

  createRecommendation: async (id, data) => {
    await companyApi.createRecommendation(id, data); get().fetchRecommendations(id);
  },

  fetchFollowups: async (id, params) => {
    try { const res = await companyApi.getFollowups(id, params); set({ followups: res.data.data }); } catch (_) {}
  },

  createFollowup: async (id, data) => {
    await companyApi.createFollowup(id, data); get().fetchFollowups(id);
  },

  updateFollowup: async (id, followupId, data) => {
    await companyApi.updateFollowup(id, followupId, data); get().fetchFollowups(id);
  },

  deleteFollowup: async (id, followupId) => {
    await companyApi.deleteFollowup(id, followupId); get().fetchFollowups(id);
  },

  fetchInsights: async () => {
    try { const res = await companyApi.getInsights(); set({ insights: res.data.data }); } catch (_) {}
  },

  fetchAnalytics: async (params) => {
    try { const res = await companyApi.getAnalytics(params); set({ analytics: res.data.data }); } catch (_) {}
  },
}));
