import { create } from 'zustand';
import { companyApi } from '../services/companyApi';
import { api } from '../services/api';
import type {
  Company, CompanyFilters, CompanyStatistics, CompanyPagination, CompanyFormData,
  CompanyNote, CompanyActivity, CompanyFile, CompanyTimelineEvent, CompanyHistoryEntry,
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

  fetchCompanies: async () => {
    set({ loading: true, error: null });
    try {
      const { filters, pagination } = get();
      const params: any = { ...filters, page: pagination.page, limit: pagination.limit };
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
  clearCurrentCompany: () => set({ currentCompany: null, timeline: [], activities: [], notes: [], files: [], history: [] }),
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
    await api.post(`${COMPANIES_URL}/${id}/activities`, data);
    get().fetchActivities(id);
  },

  updateActivity: async (id, activityId, data) => {
    await api.put(`${COMPANIES_URL}/${id}/activities/${activityId}`, data);
    get().fetchActivities(id);
  },

  deleteActivity: async (id, activityId) => {
    await api.delete(`${COMPANIES_URL}/${id}/activities/${activityId}`);
    get().fetchActivities(id);
  },

  fetchNotes: async (id) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/notes`); set({ notes: res.data.data }); } catch (_) {}
  },

  createNote: async (id, data) => {
    await api.post(`${COMPANIES_URL}/${id}/notes`, data);
    get().fetchNotes(id);
  },

  updateNote: async (id, noteId, data) => {
    await api.put(`${COMPANIES_URL}/${id}/notes/${noteId}`, data);
    get().fetchNotes(id);
  },

  deleteNote: async (id, noteId) => {
    await api.delete(`${COMPANIES_URL}/${id}/notes/${noteId}`);
    get().fetchNotes(id);
  },

  fetchFiles: async (id) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/files`); set({ files: res.data.data }); } catch (_) {}
  },

  uploadFile: async (id, data) => {
    await api.post(`${COMPANIES_URL}/${id}/files`, data);
    get().fetchFiles(id);
  },

  deleteFile: async (id, fileId) => {
    await api.delete(`${COMPANIES_URL}/${id}/files/${fileId}`);
    get().fetchFiles(id);
  },

  fetchHistory: async (id, params) => {
    try { const res = await api.get(`${COMPANIES_URL}/${id}/history`, { params }); set({ history: res.data.data }); } catch (_) {}
  },
}));
