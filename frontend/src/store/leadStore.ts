import { create } from 'zustand';
import { leadApi } from '../services/leadApi';
import type { Lead, LeadSource, LeadStatus, LeadStatistics, LeadFilters, LeadPagination, LeadFormData } from '../types/lead';

interface LeadState {
  // Data
  leads: Lead[];
  currentLead: Lead | null;
  statistics: LeadStatistics | null;
  sources: LeadSource[];
  statuses: LeadStatus[];

  // UI State
  loading: boolean;
  error: string | null;
  filters: LeadFilters;
  pagination: LeadPagination;
  selectedIds: string[];

  // Actions
  fetchLeads: () => Promise<void>;
  fetchLead: (id: string) => Promise<void>;
  createLead: (data: LeadFormData) => Promise<Lead>;
  updateLead: (id: string, data: Partial<LeadFormData>) => Promise<Lead>;
  deleteLead: (id: string) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  fetchSources: () => Promise<void>;
  fetchStatuses: () => Promise<void>;
  setFilters: (filters: Partial<LeadFilters>) => void;
  setPage: (page: number) => void;
  setSort: (sortBy: string, sortDir: 'asc' | 'desc') => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  clearCurrentLead: () => void;
  clearError: () => void;
}

export const useLeadStore = create<LeadState>((set, get) => ({
  // Initial state
  leads: [],
  currentLead: null,
  statistics: null,
  sources: [],
  statuses: [],
  loading: false,
  error: null,
  filters: {},
  pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 0 },
  selectedIds: [],

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
  clearCurrentLead: () => set({ currentLead: null }),
  clearError: () => set({ error: null }),
}));

export default useLeadStore;
