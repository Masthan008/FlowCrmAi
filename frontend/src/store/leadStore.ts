import { create } from 'zustand';
import { leadApi } from '../services/leadApi';
import type {
  Lead,
  LeadSource,
  LeadStatus,
  LeadStatistics,
  LeadFilters,
  LeadPagination,
  LeadFormData,
  LeadNote,
  LeadActivity,
  LeadFile,
  LeadTimeline,
  LeadHistory,
} from '../types/lead';

interface LeadState {
  // Core Data
  leads: Lead[];
  currentLead: Lead | null;
  statistics: LeadStatistics | null;
  sources: LeadSource[];
  statuses: LeadStatus[];
  employees: { id: string; firstName: string; lastName: string; email: string }[];

  // 360° Workspace Data
  profile: any | null;
  timeline: LeadTimeline[];
  activities: LeadActivity[];
  notes: LeadNote[];
  files: LeadFile[];
  storageSummary: { totalSize: number; fileCount: number } | null;
  history: LeadHistory[];

  // UI State
  loading: boolean;
  error: string | null;
  filters: LeadFilters;
  pagination: LeadPagination;
  selectedIds: string[];
  selectedTab: string;
  tabLoading: Record<string, boolean>;

  // Core Actions
  fetchLeads: () => Promise<void>;
  fetchLead: (id: string) => Promise<void>;
  createLead: (data: LeadFormData) => Promise<Lead>;
  updateLead: (id: string, data: Partial<LeadFormData>) => Promise<Lead>;
  deleteLead: (id: string) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  fetchSources: () => Promise<void>;
  fetchStatuses: () => Promise<void>;
  fetchEmployees: () => Promise<void>;
  setFilters: (filters: Partial<LeadFilters>) => void;
  setPage: (page: number) => void;
  setSort: (sortBy: string, sortDir: 'asc' | 'desc') => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  clearCurrentLead: () => void;
  clearError: () => void;

  // 360° Workspace Actions
  fetchProfile: (id: string) => Promise<void>;
  fetchTimeline: (id: string, filters?: any) => Promise<void>;
  fetchActivities: (id: string, filters?: any) => Promise<void>;
  fetchNotes: (id: string) => Promise<void>;
  fetchFiles: (id: string) => Promise<void>;
  fetchStorageSummary: (id: string) => Promise<void>;
  fetchHistory: (id: string, filters?: any) => Promise<void>;
  setSelectedTab: (tab: string) => void;
  
  // Note CRUD Actions
  createNote: (id: string, data: { title?: string; content: string; isPinned?: boolean }) => Promise<void>;
  updateNote: (id: string, noteId: string, data: { title?: string; content: string; isPinned?: boolean }) => Promise<void>;
  deleteNote: (id: string, noteId: string) => Promise<void>;

  // Activity CRUD Actions
  createActivity: (id: string, data: any) => Promise<void>;
  updateActivity: (id: string, activityId: string, data: any) => Promise<void>;
  deleteActivity: (id: string, activityId: string) => Promise<void>;

  // File Upload Actions
  uploadFile: (id: string, formData: FormData) => Promise<void>;
  deleteFile: (id: string, fileId: string) => Promise<void>;
}

export const useLeadStore = create<LeadState>((set, get) => ({
  // Initial state
  leads: [],
  currentLead: null,
  statistics: null,
  sources: [],
  statuses: [],
  profile: null,
  timeline: [],
  activities: [],
  notes: [],
  files: [],
  storageSummary: null,
  history: [],
  employees: [],
  loading: false,
  error: null,
  filters: {},
  pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 0 },
  selectedIds: [],
  selectedTab: 'Overview',
  tabLoading: {},

  fetchLeads: async () => {
    set({ loading: true, error: null });
    try {
      const { filters, pagination } = get();
      const params: Record<string, any> = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };
      // Remove undefined/empty values
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === '') delete params[key];
      });

      const res = await leadApi.getLeads(params);
      set({
        leads: res.data.data || [],
        pagination: res.data.pagination
          ? { ...res.data.pagination }
          : get().pagination,
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to fetch leads',
        loading: false,
      });
    }
  },

  fetchLead: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await leadApi.getLead(id);
      set({ currentLead: res.data.data, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to fetch lead',
        loading: false,
      });
    }
  },

  createLead: async (data: LeadFormData) => {
    set({ loading: true, error: null });
    try {
      const res = await leadApi.createLead(data);
      const newLead = res.data.data;
      set({ loading: false });
      // Refresh the list
      get().fetchLeads();
      get().fetchStatistics();
      return newLead;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to create lead',
        loading: false,
      });
      throw err;
    }
  },

  updateLead: async (id: string, data: Partial<LeadFormData>) => {
    set({ loading: true, error: null });
    try {
      const res = await leadApi.updateLead(id, data);
      const updatedLead = res.data.data;
      set({ currentLead: updatedLead, loading: false });
      // If profile is loaded, refresh it too
      if (get().profile) {
        get().fetchProfile(id);
      }
      get().fetchLeads();
      return updatedLead;
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to update lead',
        loading: false,
      });
      throw err;
    }
  },

  deleteLead: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await leadApi.deleteLead(id);
      set({ loading: false });
      get().fetchLeads();
      get().fetchStatistics();
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to delete lead',
        loading: false,
      });
      throw err;
    }
  },

  fetchStatistics: async () => {
    try {
      const res = await leadApi.getStatistics();
      set({ statistics: res.data.data });
    } catch {
      // Silently fail — statistics are non-critical
    }
  },

  fetchSources: async () => {
    try {
      const res = await leadApi.getSources();
      set({ sources: res.data.data || [] });
    } catch {
      // Silently fail
    }
  },

  fetchStatuses: async () => {
    try {
      const res = await leadApi.getStatuses();
      set({ statuses: res.data.data || [] });
    } catch {
      // Silently fail
    }
  },

  fetchEmployees: async () => {
    try {
      const res = await leadApi.getEmployees();
      set({ employees: res.data.data || [] });
    } catch {
      // Silently fail
    }
  },

  setFilters: (filters: Partial<LeadFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 }, // Reset to page 1 on filter change
    }));
    get().fetchLeads();
  },

  setPage: (page: number) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
    get().fetchLeads();
  },

  setSort: (sortBy: string, sortDir: 'asc' | 'desc') => {
    set((state) => ({
      filters: { ...state.filters, sortBy, sortDir },
      pagination: { ...state.pagination, page: 1 },
    }));
    get().fetchLeads();
  },

  toggleSelection: (id: string) => {
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((s) => s !== id)
        : [...state.selectedIds, id],
    }));
  },

  clearSelection: () => set({ selectedIds: [] }),
  clearCurrentLead: () => set({ currentLead: null, profile: null, timeline: [], activities: [], notes: [], files: [], history: [] }),
  clearError: () => set({ error: null }),

  // 360° Workspace Actions
  fetchProfile: async (id: string) => {
    set((state) => ({ tabLoading: { ...state.tabLoading, Overview: true }, error: null }));
    try {
      const res = await leadApi.getProfile(id);
      set((state) => ({
        profile: res.data.data,
        currentLead: res.data.data, // Keep currentLead synchronized
        tabLoading: { ...state.tabLoading, Overview: false },
      }));
    } catch (err: any) {
      set((state) => ({
        error: err.response?.data?.message || 'Failed to fetch lead profile',
        tabLoading: { ...state.tabLoading, Overview: false },
      }));
    }
  },

  fetchTimeline: async (id: string, filters?: any) => {
    set((state) => ({ tabLoading: { ...state.tabLoading, Timeline: true } }));
    try {
      const res = await leadApi.getTimeline(id, filters);
      set((state) => ({
        timeline: res.data.data || [],
        tabLoading: { ...state.tabLoading, Timeline: false },
      }));
    } catch (err: any) {
      set((state) => ({
        error: err.response?.data?.message || 'Failed to fetch timeline',
        tabLoading: { ...state.tabLoading, Timeline: false },
      }));
    }
  },

  fetchActivities: async (id: string, filters?: any) => {
    set((state) => ({ tabLoading: { ...state.tabLoading, Activities: true } }));
    try {
      const res = await leadApi.getActivities(id, filters);
      set((state) => ({
        activities: res.data.data || [],
        tabLoading: { ...state.tabLoading, Activities: false },
      }));
    } catch (err: any) {
      set((state) => ({
        error: err.response?.data?.message || 'Failed to fetch activities',
        tabLoading: { ...state.tabLoading, Activities: false },
      }));
    }
  },

  fetchNotes: async (id: string) => {
    set((state) => ({ tabLoading: { ...state.tabLoading, Notes: true } }));
    try {
      const res = await leadApi.getNotes(id);
      set((state) => ({
        notes: res.data.data || [],
        tabLoading: { ...state.tabLoading, Notes: false },
      }));
    } catch (err: any) {
      set((state) => ({
        error: err.response?.data?.message || 'Failed to fetch notes',
        tabLoading: { ...state.tabLoading, Notes: false },
      }));
    }
  },

  fetchFiles: async (id: string) => {
    set((state) => ({ tabLoading: { ...state.tabLoading, Files: true } }));
    try {
      const res = await leadApi.getFiles(id);
      set((state) => ({
        files: res.data.data || [],
        tabLoading: { ...state.tabLoading, Files: false },
      }));
    } catch (err: any) {
      set((state) => ({
        error: err.response?.data?.message || 'Failed to fetch files',
        tabLoading: { ...state.tabLoading, Files: false },
      }));
    }
  },

  fetchStorageSummary: async (id: string) => {
    try {
      const res = await leadApi.getStorageSummary(id);
      set({ storageSummary: res.data.data });
    } catch {
      // Silently fail
    }
  },

  fetchHistory: async (id: string, filters?: any) => {
    set((state) => ({ tabLoading: { ...state.tabLoading, History: true } }));
    try {
      const res = await leadApi.getHistory(id, filters);
      set((state) => ({
        history: res.data.data || [],
        tabLoading: { ...state.tabLoading, History: false },
      }));
    } catch (err: any) {
      set((state) => ({
        error: err.response?.data?.message || 'Failed to fetch audit history',
        tabLoading: { ...state.tabLoading, History: false },
      }));
    }
  },

  setSelectedTab: (tab: string) => set({ selectedTab: tab }),

  // Note CRUD Actions
  createNote: async (id: string, data: { title?: string; content: string; isPinned?: boolean }) => {
    try {
      await leadApi.createNote(id, data);
      get().fetchNotes(id);
      get().fetchTimeline(id);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to create note' });
      throw err;
    }
  },

  updateNote: async (id: string, noteId: string, data: { title?: string; content: string; isPinned?: boolean }) => {
    try {
      await leadApi.updateNote(id, noteId, data);
      get().fetchNotes(id);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update note' });
      throw err;
    }
  },

  deleteNote: async (id: string, noteId: string) => {
    try {
      await leadApi.deleteNote(id, noteId);
      get().fetchNotes(id);
      get().fetchTimeline(id);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete note' });
      throw err;
    }
  },

  // Activity CRUD Actions
  createActivity: async (id: string, data: any) => {
    try {
      await leadApi.createActivity(id, data);
      get().fetchActivities(id);
      get().fetchTimeline(id);
      get().fetchProfile(id); // Recalculate stats like first/last contact
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to create activity' });
      throw err;
    }
  },

  updateActivity: async (id: string, activityId: string, data: any) => {
    try {
      await leadApi.updateActivity(id, activityId, data);
      get().fetchActivities(id);
      get().fetchTimeline(id);
      get().fetchProfile(id);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to update activity' });
      throw err;
    }
  },

  deleteActivity: async (id: string, activityId: string) => {
    try {
      await leadApi.deleteActivity(id, activityId);
      get().fetchActivities(id);
      get().fetchTimeline(id);
      get().fetchProfile(id);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete activity' });
      throw err;
    }
  },

  // File Upload Actions
  uploadFile: async (id: string, formData: FormData) => {
    try {
      await leadApi.uploadFile(id, formData);
      get().fetchFiles(id);
      get().fetchStorageSummary(id);
      get().fetchTimeline(id);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to upload file' });
      throw err;
    }
  },

  deleteFile: async (id: string, fileId: string) => {
    try {
      await leadApi.deleteFile(id, fileId);
      get().fetchFiles(id);
      get().fetchStorageSummary(id);
      get().fetchTimeline(id);
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to delete file' });
      throw err;
    }
  },
}));

export default useLeadStore;
