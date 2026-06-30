import { create } from 'zustand';
import { dealApi } from '../services/dealApi';
import { api } from '../services/api';
import type {
  Deal,
  DealFormData,
  DealFilters,
  DealStatistics,
  DealPagination,
} from '../types/deal';

interface DealState {
  deals: Deal[];
  currentDeal: Deal | null;
  statistics: DealStatistics | null;
  employees: { id: string; firstName: string; lastName: string; email: string }[];
  customers: { id: string; name: string }[];
  companies: { id: string; name: string }[];
  contacts: { id: string; fullName: string }[];
  leads: { id: string; leadNumber: string; fullName: string }[];
  pipelines: { id: string; name: string; stages: { id: string; name: string; order: number; probability: number }[] }[];
  loading: boolean;
  error: string | null;
  filters: DealFilters;
  pagination: DealPagination;
  selectedIds: string[];

  dealNotes: any[];
  dealActivities: any[];
  dealFiles: any[];
  dealTimeline: any[];
  dealHistory: any[];
  dealProducts: any[];
  dealQuotes: any[];

  fetchDeals: () => Promise<void>;
  fetchDeal: (id: string) => Promise<void>;
  createDeal: (data: DealFormData) => Promise<Deal>;
  updateDeal: (id: string, data: Partial<DealFormData>) => Promise<Deal>;
  deleteDeal: (id: string) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  fetchEmployees: () => Promise<void>;
  fetchCustomers: () => Promise<void>;
  fetchCompanies: () => Promise<void>;
  fetchContacts: () => Promise<void>;
  fetchLeads: () => Promise<void>;
  fetchPipelines: () => Promise<void>;
  setFilters: (filters: Partial<DealFilters>) => void;
  setPage: (page: number) => void;
  toggleSelection: (id: string) => void;
  toggleAllSelection: () => void;
  clearSelection: () => void;
  clearCurrentDeal: () => void;
  clearError: () => void;
  bulkUpdateStatus: (ids: string[], status: string) => Promise<void>;
  updateStage: (id: string, stageId: string) => Promise<void>;
  bulkUpdateOwner: (ids: string[], ownerId: string) => Promise<void>;

  fetchNotes: (id: string, search?: string) => Promise<void>;
  createNote: (id: string, content: string, title?: string) => Promise<void>;
  updateNote: (id: string, noteId: string, data: any) => Promise<void>;
  deleteNote: (id: string, noteId: string) => Promise<void>;
  fetchActivities: (id: string, filters?: any) => Promise<void>;
  createActivity: (id: string, data: any) => Promise<void>;
  updateActivity: (id: string, activityId: string, data: any) => Promise<void>;
  deleteActivity: (id: string, activityId: string) => Promise<void>;
  fetchFiles: (id: string, search?: string) => Promise<void>;
  uploadFile: (id: string, fileData: any) => Promise<void>;
  deleteFile: (id: string, fileId: string) => Promise<void>;
  fetchTimeline: (id: string, search?: string) => Promise<void>;
  fetchHistory: (id: string, search?: string) => Promise<void>;
  fetchProducts: (id: string, search?: string) => Promise<void>;
  fetchQuotes: (id: string, search?: string) => Promise<void>;

  // --- Pipeline Management & Analytics State ---
  kanbanData: any[];
  pipelineList: any[];
  forecast: any;
  analytics: any;
  kpis: any;
  funnel: any;
  aging: any;
  quotas: any[];
  performance: any;
  savedViews: any[];
  pipelineHealth: any;
  kanbanFilters: any;
  activePipelineId: string | null;

  // --- Pipeline Management & Analytics Actions ---
  fetchPipelinesList: () => Promise<void>;
  createPipeline: (data: any) => Promise<void>;
  updatePipeline: (id: string, data: any) => Promise<void>;
  deletePipeline: (id: string) => Promise<void>;
  duplicatePipeline: (id: string) => Promise<void>;
  fetchKanbanData: (pipelineId?: string, filters?: any) => Promise<void>;
  moveStage: (id: string, toStageId: string) => Promise<void>;
  fetchForecast: (pipelineId?: string) => Promise<void>;
  fetchAnalytics: (pipelineId?: string) => Promise<void>;
  fetchKpis: (pipelineId?: string) => Promise<void>;
  fetchFunnel: (pipelineId?: string) => Promise<void>;
  fetchAging: (pipelineId?: string) => Promise<void>;
  fetchPipelineHealth: (pipelineId?: string) => Promise<void>;
  fetchQuotas: (params?: any) => Promise<void>;
  createQuota: (data: any) => Promise<void>;
  updateQuota: (id: string, data: any) => Promise<void>;
  deleteQuota: (id: string) => Promise<void>;
  fetchPerformance: (pipelineId?: string) => Promise<void>;
  fetchSavedViews: () => Promise<void>;
  createSavedView: (data: any) => Promise<void>;
  deleteSavedView: (id: string) => Promise<void>;
  setActivePipelineId: (id: string | null) => void;
  setKanbanFilters: (filters: any) => void;

  // --- Commercial Collaboration Workspace State ---
  dealCompetitors: any[];
  dealComments: any[];
  dealChecklist: any[];
  dealNegotiations: any[];
  dealTeamMembers: any[];

  // --- Commercial Collaboration Workspace Actions ---
  fetchDealProducts: (dealId: string, search?: string) => Promise<void>;
  addDealProduct: (dealId: string, data: any) => Promise<void>;
  updateDealProductLine: (dealId: string, productId: string, data: any) => Promise<void>;
  deleteDealProductLine: (dealId: string, productId: string) => Promise<void>;
  fetchDealQuotes: (dealId: string, search?: string) => Promise<void>;
  createDealQuote: (dealId: string, data: any) => Promise<void>;
  updateDealQuote: (dealId: string, quoteId: string, data: any) => Promise<void>;
  approveDealQuote: (dealId: string, quoteId: string) => Promise<void>;
  rejectDealQuote: (dealId: string, quoteId: string) => Promise<void>;
  fetchDealCompetitors: (dealId: string, search?: string) => Promise<void>;
  createDealCompetitor: (dealId: string, data: any) => Promise<void>;
  fetchCollaboration: (dealId: string) => Promise<void>;
  createDealComment: (dealId: string, data: any) => Promise<void>;
  fetchDealChecklist: (dealId: string) => Promise<void>;
  updateDealChecklistItem: (dealId: string, itemId: string, isCompleted: boolean) => Promise<void>;
  fetchDealNegotiations: (dealId: string) => Promise<void>;
  createDealNegotiation: (dealId: string, data: any) => Promise<void>;

  // --- Deal Intelligence & Automation State ---
  dealScore: any | null;
  dealWinProbability: any | null;
  dealHealth: any | null;
  dealRisk: any | null;
  dealRecommendations: any[];
  dealSLA: any | null;
  dealPlaybooks: any[];
  dealFollowups: any[];
  workflows: any[];
  executiveInsights: any | null;

  // --- Deal Intelligence & Automation Actions ---
  fetchDealScore: (dealId: string) => Promise<void>;
  fetchDealWinProbability: (dealId: string) => Promise<void>;
  fetchDealHealth: (dealId: string) => Promise<void>;
  fetchDealRisk: (dealId: string) => Promise<void>;
  fetchDealRecommendations: (dealId: string) => Promise<void>;
  fetchDealSLA: (dealId: string) => Promise<void>;
  updateDealLifecycle: (dealId: string, data: any) => Promise<void>;
  fetchDealPlaybooks: (dealId: string) => Promise<void>;
  fetchDealFollowups: (dealId: string) => Promise<void>;
  createDealFollowup: (dealId: string, data: any) => Promise<void>;
  fetchWorkflows: (module?: string) => Promise<void>;
  createWorkflow: (data: any) => Promise<void>;
  fetchExecutiveInsights: () => Promise<void>;
}

export const useDealStore = create<DealState>((set, get) => ({
  deals: [],
  currentDeal: null,
  statistics: null,
  employees: [],
  customers: [],
  companies: [],
  contacts: [],
  leads: [],
  pipelines: [],
  loading: false,
  error: null,
  filters: {},
  pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 0 },
  selectedIds: [],

  dealNotes: [],
  dealActivities: [],
  dealFiles: [],
  dealTimeline: [],
  dealHistory: [],
  dealProducts: [],
  dealQuotes: [],

  // --- Commercial Collaboration Workspace State ---
  dealCompetitors: [],
  dealComments: [],
  dealChecklist: [],
  dealNegotiations: [],
  dealTeamMembers: [],

  // --- Deal Intelligence & Automation State ---
  dealScore: null,
  dealWinProbability: null,
  dealHealth: null,
  dealRisk: null,
  dealRecommendations: [],
  dealSLA: null,
  dealPlaybooks: [],
  dealFollowups: [],
  workflows: [],
  executiveInsights: null,

  // --- Pipeline Management & Analytics State ---
  kanbanData: [],
  pipelineList: [],
  forecast: null,
  analytics: null,
  kpis: null,
  funnel: null,
  aging: null,
  quotas: [],
  performance: null,
  savedViews: [],
  pipelineHealth: null,
  kanbanFilters: {},
  activePipelineId: null,

  fetchDeals: async () => {
    set({ loading: true, error: null });
    try {
      const { filters, pagination } = get();
      const params: Record<string, any> = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === '') delete params[key];
      });

      const res = await dealApi.getDeals(params);
      set({
        deals: res.data.data || [],
        pagination: res.data.pagination
          ? { ...res.data.pagination }
          : get().pagination,
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to fetch deals',
        loading: false,
      });
    }
  },

  fetchDeal: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.getDeal(id);
      set({ currentDeal: res.data.data, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to fetch deal details',
        loading: false,
      });
    }
  },

  createDeal: async (data: DealFormData) => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.createDeal(data);
      const newDeal = res.data.data;
      set({ loading: false });
      get().fetchDeals();
      get().fetchStatistics();
      return newDeal;
    } catch (err: any) {
      set({ loading: false });
      throw err;
    }
  },

  updateDeal: async (id: string, data: Partial<DealFormData>) => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.updateDeal(id, data);
      const updated = res.data.data;
      set({ loading: false });
      if (get().currentDeal?.id === id) {
        set({ currentDeal: updated });
      }
      get().fetchDeals();
      return updated;
    } catch (err: any) {
      set({ loading: false });
      throw err;
    }
  },

  deleteDeal: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await dealApi.deleteDeal(id);
      set({ loading: false });
      get().fetchDeals();
      get().fetchStatistics();
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to delete deal',
        loading: false,
      });
      throw err;
    }
  },

  fetchStatistics: async () => {
    try {
      const res = await dealApi.getStatistics();
      set({ statistics: res.data.data });
    } catch (err: any) {
      console.error('Failed to fetch deal statistics', err);
    }
  },

  fetchEmployees: async () => {
    try {
      const res = await api.get('/deals/employees');
      set({ employees: res.data.data || [] });
    } catch (err: any) {
      console.error('Failed to fetch employees list', err);
    }
  },

  fetchCustomers: async () => {
    try {
      const res = await api.get('/customers');
      const items = res.data.data?.items || res.data.data || [];
      set({ customers: items });
    } catch (err: any) {
      console.error('Failed to fetch customers list', err);
    }
  },

  fetchCompanies: async () => {
    try {
      const res = await api.get('/companies');
      const items = res.data.data?.items || res.data.data || [];
      set({ companies: items });
    } catch (err: any) {
      console.error('Failed to fetch companies list', err);
    }
  },

  fetchContacts: async () => {
    try {
      const res = await api.get('/contacts?limit=100');
      const items = res.data.data || [];
      set({ contacts: items });
    } catch (err: any) {
      console.error('Failed to fetch contacts list', err);
    }
  },

  fetchLeads: async () => {
    try {
      const res = await api.get('/leads?limit=100');
      const items = res.data.data || [];
      set({ leads: items });
    } catch (err: any) {
      console.error('Failed to fetch leads list', err);
    }
  },

  fetchPipelines: async () => {
    try {
      const res = await api.get('/pipelines');
      const items = res.data.data?.items || res.data.data || [];
      set({ pipelines: items });
    } catch (err: any) {
      console.error('Failed to fetch pipelines list', err);
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 },
    }));
    get().fetchDeals();
  },

  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
    get().fetchDeals();
  },

  toggleSelection: (id) => {
    set((state) => {
      const isSelected = state.selectedIds.includes(id);
      const selectedIds = isSelected
        ? state.selectedIds.filter((item) => item !== id)
        : [...state.selectedIds, id];
      return { selectedIds };
    });
  },

  toggleAllSelection: () => {
    set((state) => {
      const allIdsOnPage = state.deals.map((d) => d.id);
      const allSelected = allIdsOnPage.every((id) => state.selectedIds.includes(id));
      const selectedIds = allSelected
        ? state.selectedIds.filter((id) => !allIdsOnPage.includes(id))
        : Array.from(new Set([...state.selectedIds, ...allIdsOnPage]));
      return { selectedIds };
    });
  },

  clearSelection: () => set({ selectedIds: [] }),
  clearCurrentDeal: () => set({ currentDeal: null, loading: false, error: null }),
  clearError: () => set({ error: null }),

  bulkUpdateStatus: async (ids, status) => {
    set({ loading: true, error: null });
    try {
      await dealApi.bulkUpdateStatus(ids, status);
      set({ loading: false, selectedIds: [] });
      get().fetchDeals();
      get().fetchStatistics();
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to bulk update status',
        loading: false,
      });
      throw err;
    }
  },

  updateStage: async (id, stageId) => {
    set({ loading: true, error: null });
    try {
      await dealApi.updateStage(id, stageId);
      set({ loading: false });
      get().fetchDeals();
      get().fetchStatistics();
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to update stage',
        loading: false,
      });
      throw err;
    }
  },

  bulkUpdateOwner: async (ids, ownerId) => {
    set({ loading: true, error: null });
    try {
      await dealApi.bulkUpdateOwner(ids, ownerId);
      set({ loading: false, selectedIds: [] });
      get().fetchDeals();
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to bulk update owner',
        loading: false,
      });
      throw err;
    }
  },

  fetchNotes: async (id, search) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/deals/${id}/notes`, { params: { search } });
      set({ dealNotes: res.data.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch notes', loading: false });
    }
  },

  createNote: async (id, content, title) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/deals/${id}/notes`, { content, title });
      set({ loading: false });
      get().fetchNotes(id);
      get().fetchTimeline(id);
      get().fetchHistory(id);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to create note', loading: false });
      throw err;
    }
  },

  updateNote: async (id, noteId, data) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/deals/${id}/notes/${noteId}`, data);
      set({ loading: false });
      get().fetchNotes(id);
      get().fetchHistory(id);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update note', loading: false });
      throw err;
    }
  },

  deleteNote: async (id, noteId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/deals/${id}/notes/${noteId}`);
      set({ loading: false });
      get().fetchNotes(id);
      get().fetchHistory(id);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete note', loading: false });
      throw err;
    }
  },

  fetchActivities: async (id, filters) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/deals/${id}/activities`, { params: filters });
      set({ dealActivities: res.data.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch activities', loading: false });
    }
  },

  createActivity: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/deals/${id}/activities`, data);
      set({ loading: false });
      get().fetchActivities(id);
      get().fetchTimeline(id);
      get().fetchHistory(id);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to create activity', loading: false });
      throw err;
    }
  },

  updateActivity: async (id, activityId, data) => {
    set({ loading: true, error: null });
    try {
      await api.put(`/deals/${id}/activities/${activityId}`, data);
      set({ loading: false });
      get().fetchActivities(id);
      get().fetchHistory(id);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update activity', loading: false });
      throw err;
    }
  },

  deleteActivity: async (id, activityId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/deals/${id}/activities/${activityId}`);
      set({ loading: false });
      get().fetchActivities(id);
      get().fetchHistory(id);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete activity', loading: false });
      throw err;
    }
  },

  fetchFiles: async (id, search) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/deals/${id}/files`, { params: { search } });
      set({ dealFiles: res.data.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch files', loading: false });
    }
  },

  uploadFile: async (id, fileData) => {
    set({ loading: true, error: null });
    try {
      await api.post(`/deals/${id}/files`, fileData);
      set({ loading: false });
      get().fetchFiles(id);
      get().fetchTimeline(id);
      get().fetchHistory(id);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to attach file', loading: false });
      throw err;
    }
  },

  deleteFile: async (id, fileId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/deals/${id}/files/${fileId}`);
      set({ loading: false });
      get().fetchFiles(id);
      get().fetchHistory(id);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete file', loading: false });
      throw err;
    }
  },

  fetchTimeline: async (id, search) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/deals/${id}/timeline`, { params: { search } });
      set({ dealTimeline: res.data.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch timeline', loading: false });
    }
  },

  fetchHistory: async (id, search) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/deals/${id}/history`, { params: { search } });
      set({ dealHistory: res.data.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch history', loading: false });
    }
  },

  fetchProducts: async (id, search) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/deals/${id}/products`, { params: { search } });
      set({ dealProducts: res.data.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch products', loading: false });
    }
  },

  fetchQuotes: async (id, search) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/deals/${id}/quotes`, { params: { search } });
      set({ dealQuotes: res.data.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch quotes', loading: false });
    }
  },

  // ─── Pipeline CRUD Actions ───
  fetchPipelinesList: async () => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.getPipelines();
      const list = res.data?.data || [];
      set({ pipelineList: list, loading: false });
      if (list.length > 0 && !get().activePipelineId) {
        set({ activePipelineId: list[0].id });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch pipelines', loading: false });
    }
  },

  createPipeline: async (data) => {
    set({ loading: true, error: null });
    try {
      await dealApi.createPipeline(data);
      set({ loading: false });
      get().fetchPipelinesList();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to create pipeline', loading: false });
      throw err;
    }
  },

  updatePipeline: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await dealApi.updatePipeline(id, data);
      set({ loading: false });
      get().fetchPipelinesList();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update pipeline', loading: false });
      throw err;
    }
  },

  deletePipeline: async (id) => {
    set({ loading: true, error: null });
    try {
      await dealApi.deletePipeline(id);
      set({ loading: false, activePipelineId: null });
      get().fetchPipelinesList();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete pipeline', loading: false });
      throw err;
    }
  },

  duplicatePipeline: async (id) => {
    set({ loading: true, error: null });
    try {
      await dealApi.duplicatePipeline(id);
      set({ loading: false });
      get().fetchPipelinesList();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to duplicate pipeline', loading: false });
      throw err;
    }
  },

  // ─── Kanban Actions ───
  fetchKanbanData: async (pipelineId, filters) => {
    set({ loading: true, error: null });
    try {
      const activePipe = pipelineId || get().activePipelineId || undefined;
      const res = await dealApi.getKanban(activePipe ? { pipelineId: activePipe, ...filters } : filters);
      set({ kanbanData: res.data?.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch Kanban data', loading: false });
    }
  },

  moveStage: async (id, toStageId) => {
    try {
      // Optimistic update
      const prevKanban = get().kanbanData;
      const updatedKanban = prevKanban.map((deal) =>
        deal.id === id ? { ...deal, stageId: toStageId } : deal
      );
      set({ kanbanData: updatedKanban });

      await dealApi.moveStage(id, toStageId);
      // Refresh timeline/history if necessary
      get().fetchTimeline(id);
    } catch (err: any) {
      // Revert on failure
      get().fetchKanbanData();
      set({ error: err.response?.data?.message || 'Failed to move deal stage' });
      throw err;
    }
  },

  // ─── Intelligence Actions ───
  fetchForecast: async (pipelineId) => {
    set({ loading: true, error: null });
    try {
      const activePipe = pipelineId || get().activePipelineId || undefined;
      const res = await dealApi.getForecast(activePipe ? { pipelineId: activePipe } : undefined);
      set({ forecast: res.data?.data || null, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch forecasting data', loading: false });
    }
  },

  fetchAnalytics: async (pipelineId) => {
    set({ loading: true, error: null });
    try {
      const activePipe = pipelineId || get().activePipelineId || undefined;
      const res = await dealApi.getAnalytics(activePipe ? { pipelineId: activePipe } : undefined);
      set({ analytics: res.data?.data || null, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch analytics data', loading: false });
    }
  },

  fetchKpis: async (pipelineId) => {
    set({ loading: true, error: null });
    try {
      const activePipe = pipelineId || get().activePipelineId || undefined;
      const res = await dealApi.getKpis(activePipe ? { pipelineId: activePipe } : undefined);
      set({ kpis: res.data?.data || null, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch KPIs', loading: false });
    }
  },

  fetchFunnel: async (pipelineId) => {
    set({ loading: true, error: null });
    try {
      const activePipe = pipelineId || get().activePipelineId || undefined;
      const res = await dealApi.getFunnel(activePipe ? { pipelineId: activePipe } : undefined);
      set({ funnel: res.data?.data || null, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch funnel metrics', loading: false });
    }
  },

  fetchAging: async (pipelineId) => {
    set({ loading: true, error: null });
    try {
      const activePipe = pipelineId || get().activePipelineId || undefined;
      const res = await dealApi.getAging(activePipe ? { pipelineId: activePipe } : undefined);
      set({ aging: res.data?.data || null, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch aging metrics', loading: false });
    }
  },

  fetchPipelineHealth: async (pipelineId) => {
    set({ loading: true, error: null });
    try {
      const activePipe = pipelineId || get().activePipelineId || undefined;
      const res = await dealApi.getPipelineHealth(activePipe ? { pipelineId: activePipe } : undefined);
      set({ pipelineHealth: res.data?.data || null, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch pipeline health', loading: false });
    }
  },

  // ─── Quota Actions ───
  fetchQuotas: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.getQuotas(params);
      set({ quotas: res.data?.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch quotas', loading: false });
    }
  },

  createQuota: async (data) => {
    set({ loading: true, error: null });
    try {
      await dealApi.createQuota(data);
      set({ loading: false });
      get().fetchQuotas();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to create quota', loading: false });
      throw err;
    }
  },

  updateQuota: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await dealApi.updateQuota(id, data);
      set({ loading: false });
      get().fetchQuotas();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update quota', loading: false });
      throw err;
    }
  },

  deleteQuota: async (id) => {
    set({ loading: true, error: null });
    try {
      await dealApi.deleteQuota(id);
      set({ loading: false });
      get().fetchQuotas();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete quota', loading: false });
      throw err;
    }
  },

  // ─── Performance Actions ───
  fetchPerformance: async (pipelineId) => {
    set({ loading: true, error: null });
    try {
      const activePipe = pipelineId || get().activePipelineId || undefined;
      const res = await dealApi.getPerformance(activePipe ? { pipelineId: activePipe } : undefined);
      set({ performance: res.data?.data || null, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch team performance', loading: false });
    }
  },

  // ─── Saved View Actions ───
  fetchSavedViews: async () => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.getPipelineViews();
      set({ savedViews: res.data?.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch pipeline views', loading: false });
    }
  },

  createSavedView: async (data) => {
    set({ loading: true, error: null });
    try {
      await dealApi.createPipelineView(data);
      set({ loading: false });
      get().fetchSavedViews();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to create pipeline view', loading: false });
      throw err;
    }
  },

  deleteSavedView: async (id) => {
    set({ loading: true, error: null });
    try {
      await dealApi.deletePipelineView(id);
      set({ loading: false });
      get().fetchSavedViews();
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete pipeline view', loading: false });
      throw err;
    }
  },

  setActivePipelineId: (id) => {
    set({ activePipelineId: id });
  },

  setKanbanFilters: (filters) => {
    set({ kanbanFilters: filters });
  },

  // ─── Commercial Collaboration Actions ───
  fetchDealProducts: async (dealId, search) => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.getDealProducts(dealId, search);
      set({ dealProducts: res.data?.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch deal products', loading: false });
    }
  },

  addDealProduct: async (dealId, data) => {
    set({ loading: true, error: null });
    try {
      await dealApi.addDealProduct(dealId, data);
      set({ loading: false });
      get().fetchDealProducts(dealId);
      get().fetchTimeline(dealId);
      get().fetchHistory(dealId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to map product', loading: false });
      throw err;
    }
  },

  updateDealProductLine: async (dealId, productId, data) => {
    set({ loading: true, error: null });
    try {
      await dealApi.updateDealProductLine(dealId, productId, data);
      set({ loading: false });
      get().fetchDealProducts(dealId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update product line', loading: false });
      throw err;
    }
  },

  deleteDealProductLine: async (dealId, productId) => {
    set({ loading: true, error: null });
    try {
      await dealApi.deleteDealProductLine(dealId, productId);
      set({ loading: false });
      get().fetchDealProducts(dealId);
      get().fetchTimeline(dealId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete product line', loading: false });
      throw err;
    }
  },

  fetchDealQuotes: async (dealId, search) => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.getDealQuotes(dealId, search);
      set({ dealQuotes: res.data?.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch quotes', loading: false });
    }
  },

  createDealQuote: async (dealId, data) => {
    set({ loading: true, error: null });
    try {
      await dealApi.createDealQuote(dealId, data);
      set({ loading: false });
      get().fetchDealQuotes(dealId);
      get().fetchTimeline(dealId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to prepare quote', loading: false });
      throw err;
    }
  },

  updateDealQuote: async (dealId, quoteId, data) => {
    set({ loading: true, error: null });
    try {
      await dealApi.updateDealQuote(dealId, quoteId, data);
      set({ loading: false });
      get().fetchDealQuotes(dealId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update quote', loading: false });
      throw err;
    }
  },

  approveDealQuote: async (dealId, quoteId) => {
    set({ loading: true, error: null });
    try {
      await dealApi.approveDealQuote(dealId, quoteId);
      set({ loading: false });
      get().fetchDealQuotes(dealId);
      get().fetchTimeline(dealId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to approve quote', loading: false });
      throw err;
    }
  },

  rejectDealQuote: async (dealId, quoteId) => {
    set({ loading: true, error: null });
    try {
      await dealApi.rejectDealQuote(dealId, quoteId);
      set({ loading: false });
      get().fetchDealQuotes(dealId);
      get().fetchTimeline(dealId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to reject quote', loading: false });
      throw err;
    }
  },

  fetchDealCompetitors: async (dealId, search) => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.getDealCompetitors(dealId, search);
      set({ dealCompetitors: res.data?.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch competitors', loading: false });
    }
  },

  createDealCompetitor: async (dealId, data) => {
    set({ loading: true, error: null });
    try {
      await dealApi.createDealCompetitor(dealId, data);
      set({ loading: false });
      get().fetchDealCompetitors(dealId);
      get().fetchTimeline(dealId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to log competitor', loading: false });
      throw err;
    }
  },

  fetchCollaboration: async (dealId) => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.getDealCollaboration(dealId);
      set({
        dealComments: res.data?.data?.comments || [],
        dealTeamMembers: res.data?.data?.team || [],
        loading: false
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch collaboration details', loading: false });
    }
  },

  createDealComment: async (dealId, data) => {
    set({ loading: true, error: null });
    try {
      await dealApi.createDealComment(dealId, data);
      set({ loading: false });
      get().fetchCollaboration(dealId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to post comment', loading: false });
      throw err;
    }
  },

  fetchDealChecklist: async (dealId) => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.getDealChecklist(dealId);
      set({ dealChecklist: res.data?.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch checklist', loading: false });
    }
  },

  updateDealChecklistItem: async (dealId, itemId, isCompleted) => {
    try {
      // Optimistic update
      const prevChecklist = get().dealChecklist;
      set({
        dealChecklist: prevChecklist.map(item =>
          item.id === itemId ? { ...item, isCompleted } : item
        )
      });
      await dealApi.updateDealChecklistItem(dealId, itemId, isCompleted);
      get().fetchTimeline(dealId);
    } catch (err: any) {
      get().fetchDealChecklist(dealId);
      set({ error: err.response?.data?.message || 'Failed to update checklist item' });
    }
  },

  fetchDealNegotiations: async (dealId) => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.getDealNegotiations(dealId);
      set({ dealNegotiations: res.data?.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch negotiations', loading: false });
    }
  },

  createDealNegotiation: async (dealId, data) => {
    set({ loading: true, error: null });
    try {
      await dealApi.createDealNegotiation(dealId, data);
      set({ loading: false });
      get().fetchDealNegotiations(dealId);
      get().fetchTimeline(dealId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to add negotiation round', loading: false });
      throw err;
    }
  },

  // --- Deal Intelligence & Automation Actions ---
  fetchDealScore: async (dealId) => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.getDealScore(dealId);
      set({ dealScore: res.data?.data || null, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch deal score', loading: false });
    }
  },

  fetchDealWinProbability: async (dealId) => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.getDealWinProbability(dealId);
      set({ dealWinProbability: res.data?.data || null, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch win probability', loading: false });
    }
  },

  fetchDealHealth: async (dealId) => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.getDealHealth(dealId);
      set({ dealHealth: res.data?.data || null, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch deal health', loading: false });
    }
  },

  fetchDealRisk: async (dealId) => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.getDealRisk(dealId);
      set({ dealRisk: res.data?.data || null, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch risk status', loading: false });
    }
  },

  fetchDealRecommendations: async (dealId) => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.getDealRecommendations(dealId);
      set({ dealRecommendations: res.data?.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch recommendations', loading: false });
    }
  },

  fetchDealSLA: async (dealId) => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.getDealSLA(dealId);
      set({ dealSLA: res.data?.data || null, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch SLA details', loading: false });
    }
  },

  updateDealLifecycle: async (dealId, data) => {
    set({ loading: true, error: null });
    try {
      await dealApi.updateDealLifecycle(dealId, data);
      set({ loading: false });
      get().fetchDeal(dealId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update lifecycle stage duration', loading: false });
      throw err;
    }
  },

  fetchDealPlaybooks: async (dealId) => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.getDealPlaybooks(dealId);
      set({ dealPlaybooks: res.data?.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch playbooks list', loading: false });
    }
  },

  fetchDealFollowups: async (dealId) => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.getDealFollowups(dealId);
      set({ dealFollowups: res.data?.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch followup schedule', loading: false });
    }
  },

  createDealFollowup: async (dealId, data) => {
    set({ loading: true, error: null });
    try {
      await dealApi.createDealFollowup(dealId, data);
      set({ loading: false });
      get().fetchDealFollowups(dealId);
      get().fetchTimeline(dealId);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to log follow-up reminder', loading: false });
      throw err;
    }
  },

  fetchWorkflows: async (module) => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.getWorkflows(module);
      set({ workflows: res.data?.data || [], loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to fetch CRM workflows list', loading: false });
    }
  },

  createWorkflow: async (data) => {
    set({ loading: true, error: null });
    try {
      await dealApi.createWorkflow(data);
      set({ loading: false });
      get().fetchWorkflows('Deal');
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to create active CRM workflow trigger', loading: false });
      throw err;
    }
  },

  fetchExecutiveInsights: async () => {
    set({ loading: true, error: null });
    try {
      const res = await dealApi.getExecutiveInsights();
      set({ executiveInsights: res.data?.data || null, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to load sales executive reporting insights', loading: false });
    }
  },
}));

export default useDealStore;
