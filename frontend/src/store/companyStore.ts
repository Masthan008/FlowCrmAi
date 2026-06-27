import { create } from 'zustand';
import { companyApi } from '../services/companyApi';
import type {
  Company,
  CompanyFilters,
  CompanyStatistics,
  CompanyPagination,
  CompanyFormData,
} from '../types/company';

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

  fetchCompanies: async () => {
    set({ loading: true, error: null });
    try {
      const { filters, pagination } = get();
      const params: any = { ...filters, page: pagination.page, limit: pagination.limit };
      const res = await companyApi.getCompanies(params);
      set({
        companies: res.data.data,
        pagination: res.data.pagination,
        loading: false,
      });
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
    try {
      const res = await companyApi.getStatistics();
      set({ statistics: res.data.data });
    } catch (_) {}
  },

  fetchEmployees: async () => {
    try {
      const res = await companyApi.getEmployees();
      set({ employees: res.data.data });
    } catch (_) {}
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      pagination: { ...state.pagination, page: 1 },
    }));
  },

  setPage: (page) => {
    set((state) => ({ pagination: { ...state.pagination, page } }));
  },

  toggleSelection: (id) => {
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((sid) => sid !== id)
        : [...state.selectedIds, id],
    }));
  },

  toggleAllSelection: () => {
    set((state) => ({
      selectedIds:
        state.selectedIds.length === state.companies.length
          ? []
          : state.companies.map((c) => c.id),
    }));
  },

  clearSelection: () => set({ selectedIds: [] }),
  clearCurrentCompany: () => set({ currentCompany: null }),
  clearError: () => set({ error: null }),

  bulkUpdateStatus: async (ids, status) => {
    await companyApi.bulkUpdateStatus(ids, status);
    get().fetchCompanies();
  },

  bulkUpdateOwner: async (ids, ownerId) => {
    await companyApi.bulkUpdateOwner(ids, ownerId);
    get().fetchCompanies();
  },
}));
