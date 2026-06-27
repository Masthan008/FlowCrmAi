import { create } from 'zustand';
import { contactApi } from '../services/contactApi';
import { api } from '../services/api';
import type {
  Contact,
  ContactFilters,
  ContactStatistics,
  ContactPagination,
  ContactFormData,
} from '../types/contact';

interface ContactState {
  // Core Data
  contacts: Contact[];
  currentContact: Contact | null;
  statistics: ContactStatistics | null;
  employees: { id: string; firstName: string; lastName: string; email: string }[];
  companies: { id: string; name: string }[];
  leads: { id: string; leadNumber: string; fullName: string }[];

  // UI State
  loading: boolean;
  error: string | null;
  filters: ContactFilters;
  pagination: ContactPagination;
  selectedIds: string[];

  // Core Actions
  fetchContacts: () => Promise<void>;
  fetchContact: (id: string) => Promise<void>;
  createContact: (data: ContactFormData) => Promise<Contact>;
  updateContact: (id: string, data: Partial<ContactFormData>) => Promise<Contact>;
  deleteContact: (id: string) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  fetchEmployees: () => Promise<void>;
  fetchCompanies: () => Promise<void>;
  fetchLeads: () => Promise<void>;
  
  // Selection Actions
  setFilters: (filters: Partial<ContactFilters>) => void;
  setPage: (page: number) => void;
  setSort: (sortBy: string, sortDir: 'asc' | 'desc') => void;
  toggleSelection: (id: string) => void;
  toggleAllSelection: () => void;
  clearSelection: () => void;
  clearCurrentContact: () => void;
  clearError: () => void;

  // Bulk operations
  bulkUpdateStatus: (ids: string[], status: string) => Promise<void>;
  bulkUpdateOwner: (ids: string[], ownerId: string) => Promise<void>;
}

export const useContactStore = create<ContactState>((set, get) => ({
  // Initial state
  contacts: [],
  currentContact: null,
  statistics: null,
  employees: [],
  companies: [],
  leads: [],
  loading: false,
  error: null,
  filters: {},
  pagination: { page: 1, limit: 20, totalItems: 0, totalPages: 0 },
  selectedIds: [],

  fetchContacts: async () => {
    set({ loading: true, error: null });
    try {
      const { filters, pagination } = get();
      const params: Record<string, any> = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      // Clean empty fields
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === '') delete params[key];
      });

      const res = await contactApi.getContacts(params);
      set({
        contacts: res.data.data || [],
        pagination: res.data.pagination
          ? { ...res.data.pagination }
          : get().pagination,
        loading: false,
      });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to fetch contacts',
        loading: false,
      });
    }
  },

  fetchContact: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await contactApi.getContact(id);
      set({ currentContact: res.data.data, loading: false });
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to fetch contact details',
        loading: false,
      });
    }
  },

  createContact: async (data: ContactFormData) => {
    set({ loading: true, error: null });
    try {
      const res = await contactApi.createContact(data);
      const newContact = res.data.data;
      set({ loading: false });
      get().fetchContacts();
      get().fetchStatistics();
      return newContact;
    } catch (err: any) {
      set({ loading: false });
      throw err;
    }
  },

  updateContact: async (id: string, data: Partial<ContactFormData>) => {
    set({ loading: true, error: null });
    try {
      const res = await contactApi.updateContact(id, data);
      const updated = res.data.data;
      set({ loading: false });
      if (get().currentContact?.id === id) {
        set({ currentContact: updated });
      }
      get().fetchContacts();
      return updated;
    } catch (err: any) {
      set({ loading: false });
      throw err;
    }
  },

  deleteContact: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await contactApi.deleteContact(id);
      set({ loading: false });
      get().fetchContacts();
      get().fetchStatistics();
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to delete contact',
        loading: false,
      });
      throw err;
    }
  },

  fetchStatistics: async () => {
    try {
      const res = await contactApi.getStatistics();
      set({ statistics: res.data.data });
    } catch (err: any) {
      console.error('Failed to fetch contact statistics', err);
    }
  },

  fetchEmployees: async () => {
    try {
      const res = await api.get('/leads/employees');
      set({ employees: res.data.data || [] });
    } catch (err: any) {
      console.error('Failed to fetch employees list', err);
    }
  },

  fetchCompanies: async () => {
    try {
      const res = await api.get('/companies');
      // Placed company model returns items inside data.items or data
      const items = res.data.data?.items || res.data.data || [];
      set({ companies: items });
    } catch (err: any) {
      console.error('Failed to fetch companies list', err);
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

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 },
    }));
    get().fetchContacts();
  },

  setPage: (page) => {
    set((state) => ({
      pagination: { ...state.pagination, page },
    }));
    get().fetchContacts();
  },

  setSort: (sortBy, sortDir) => {
    set((state) => ({
      filters: { ...state.filters, sortBy, sortDir },
      pagination: { ...state.pagination, page: 1 },
    }));
    get().fetchContacts();
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
      const allIdsOnPage = state.contacts.map((c) => c.id);
      const allSelected = allIdsOnPage.every((id) => state.selectedIds.includes(id));
      const selectedIds = allSelected
        ? state.selectedIds.filter((id) => !allIdsOnPage.includes(id))
        : Array.from(new Set([...state.selectedIds, ...allIdsOnPage]));
      return { selectedIds };
    });
  },

  clearSelection: () => set({ selectedIds: [] }),
  clearCurrentContact: () => set({ currentContact: null }),
  clearError: () => set({ error: null }),

  bulkUpdateStatus: async (ids, status) => {
    set({ loading: true, error: null });
    try {
      await contactApi.bulkUpdateStatus(ids, status);
      set({ loading: false, selectedIds: [] });
      get().fetchContacts();
      get().fetchStatistics();
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to bulk update status',
        loading: false,
      });
      throw err;
    }
  },

  bulkUpdateOwner: async (ids, ownerId) => {
    set({ loading: true, error: null });
    try {
      await contactApi.bulkUpdateOwner(ids, ownerId);
      set({ loading: false, selectedIds: [] });
      get().fetchContacts();
    } catch (err: any) {
      set({
        error: err.response?.data?.message || 'Failed to bulk update owner',
        loading: false,
      });
      throw err;
    }
  },
}));

export default useContactStore;
