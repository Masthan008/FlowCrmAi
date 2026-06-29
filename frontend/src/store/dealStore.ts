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
}));

export default useDealStore;
