import { create } from 'zustand';
import { contactApi } from '../services/contactApi';
import { api } from '../services/api';
import type {
  Contact,
  ContactFilters,
  ContactStatistics,
  ContactPagination,
  ContactFormData,
  ContactTimeline,
  ContactActivity,
  ContactNote,
  ContactFile,
  ContactHistory,
  ContactRelationship,
  ContactCall,
  ContactEmailLog,
  ContactWhatsAppLog,
  ContactMeetingLog,
  ContactBusinessMetric,
  ContactHealth,
  ContactEngagement,
  JourneyEvent,
} from '../types/contact';

interface ContactState {
  // Core Data
  contacts: Contact[];
  currentContact: Contact | null;
  statistics: ContactStatistics | null;
  employees: { id: string; firstName: string; lastName: string; email: string }[];
  companies: { id: string; name: string }[];
  leads: { id: string; leadNumber: string; fullName: string }[];

  // 360° Workspace Data
  timeline: ContactTimeline[];
  activities: ContactActivity[];
  notes: ContactNote[];
  files: ContactFile[];
  history: ContactHistory[];
  relationships: ContactRelationship[];
  journeyEvents: JourneyEvent[];
  communications: any[];
  calls: ContactCall[];
  emailsLogs: ContactEmailLog[];
  meetingsLogs: ContactMeetingLog[];
  businessMetrics: ContactBusinessMetric | null;
  health: ContactHealth | null;
  engagementScore: ContactEngagement | null;

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

  // 360° Workspace Actions
  fetchTimeline: (id: string, search?: string) => Promise<void>;
  fetchActivities: (id: string, params?: any) => Promise<void>;
  createActivity: (id: string, data: any) => Promise<void>;
  updateActivity: (id: string, activityId: string, data: any) => Promise<void>;
  deleteActivity: (id: string, activityId: string) => Promise<void>;
  fetchNotes: (id: string, search?: string) => Promise<void>;
  createNote: (id: string, data: any) => Promise<void>;
  updateNote: (id: string, noteId: string, data: any) => Promise<void>;
  deleteNote: (id: string, noteId: string) => Promise<void>;
  fetchFiles: (id: string, search?: string) => Promise<void>;
  uploadFile: (id: string, data: any) => Promise<void>;
  deleteFile: (id: string, fileId: string) => Promise<void>;
  fetchHistory: (id: string, search?: string) => Promise<void>;
  fetchRelationships: (id: string) => Promise<void>;
  fetchJourney: (id: string) => Promise<void>;
  fetchCommunications: (id: string) => Promise<void>;
  fetchCalls: (id: string) => Promise<void>;
  fetchEmailsLogs: (id: string) => Promise<void>;
  fetchMeetingsLogs: (id: string) => Promise<void>;
  fetchBusinessMetrics: (id: string) => Promise<void>;
  fetchHealth: (id: string) => Promise<void>;
  fetchEngagementScore: (id: string) => Promise<void>;
}

export const useContactStore = create<ContactState>((set, get) => ({
  // Initial state
  contacts: [],
  currentContact: null,
  statistics: null,
  employees: [],
  companies: [],
  leads: [],
  timeline: [],
  activities: [],
  notes: [],
  files: [],
  history: [],
  relationships: [],
  journeyEvents: [],
  communications: [],
  calls: [],
  emailsLogs: [],
  meetingsLogs: [],
  businessMetrics: null,
  health: null,
  engagementScore: null,
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

  // 360° Workspace Actions implementation
  fetchTimeline: async (id, search) => {
    try {
      const res = await api.get(`/contacts/${id}/timeline`, { params: { search } });
      set({ timeline: res.data.data || [] });
    } catch (err) {
      console.error('Failed to fetch contact timeline logs', err);
    }
  },

  fetchActivities: async (id, params) => {
    try {
      const res = await api.get(`/contacts/${id}/activities`, { params });
      set({ activities: res.data.data || [] });
    } catch (err) {
      console.error('Failed to fetch contact activities list', err);
    }
  },

  createActivity: async (id, data) => {
    try {
      await api.post(`/contacts/${id}/activities`, data);
      get().fetchActivities(id);
      get().fetchTimeline(id);
    } catch (err) {
      console.error('Failed to create activity record', err);
      throw err;
    }
  },

  updateActivity: async (id, activityId, data) => {
    try {
      await api.put(`/contacts/${id}/activities/${activityId}`, data);
      get().fetchActivities(id);
      get().fetchTimeline(id);
    } catch (err) {
      console.error('Failed to update activity record', err);
      throw err;
    }
  },

  deleteActivity: async (id, activityId) => {
    try {
      await api.delete(`/contacts/${id}/activities/${activityId}`);
      get().fetchActivities(id);
      get().fetchTimeline(id);
    } catch (err) {
      console.error('Failed to delete activity record', err);
      throw err;
    }
  },

  fetchNotes: async (id, search) => {
    try {
      const res = await api.get(`/contacts/${id}/notes`, { params: { search } });
      set({ notes: res.data.data || [] });
    } catch (err) {
      console.error('Failed to fetch contact notes list', err);
    }
  },

  createNote: async (id, data) => {
    try {
      await api.post(`/contacts/${id}/notes`, data);
      get().fetchNotes(id);
      get().fetchTimeline(id);
    } catch (err) {
      console.error('Failed to create note record', err);
      throw err;
    }
  },

  updateNote: async (id, noteId, data) => {
    try {
      await api.put(`/contacts/${id}/notes/${noteId}`, data);
      get().fetchNotes(id);
    } catch (err) {
      console.error('Failed to update note record', err);
      throw err;
    }
  },

  deleteNote: async (id, noteId) => {
    try {
      await api.delete(`/contacts/${id}/notes/${noteId}`);
      get().fetchNotes(id);
      get().fetchTimeline(id);
    } catch (err) {
      console.error('Failed to delete note record', err);
      throw err;
    }
  },

  fetchFiles: async (id, search) => {
    try {
      const res = await api.get(`/contacts/${id}/files`, { params: { search } });
      set({ files: res.data.data || [] });
    } catch (err) {
      console.error('Failed to fetch contact files list', err);
    }
  },

  uploadFile: async (id, data) => {
    try {
      await api.post(`/contacts/${id}/files`, data);
      get().fetchFiles(id);
      get().fetchTimeline(id);
    } catch (err) {
      console.error('Failed to upload contact file', err);
      throw err;
    }
  },

  deleteFile: async (id, fileId) => {
    try {
      await api.delete(`/contacts/${id}/files/${fileId}`);
      get().fetchFiles(id);
      get().fetchTimeline(id);
    } catch (err) {
      console.error('Failed to delete contact file', err);
      throw err;
    }
  },

  fetchHistory: async (id, search) => {
    try {
      const res = await api.get(`/contacts/${id}/history`, { params: { search } });
      set({ history: res.data.data || [] });
    } catch (err) {
      console.error('Failed to fetch contact history logs', err);
    }
  },

  fetchRelationships: async (id) => {
    try {
      const res = await api.get(`/contacts/${id}/relationships`);
      set({ relationships: res.data.data || [] });
    } catch (err) {
      console.error('Failed to fetch contact relationships', err);
    }
  },

  fetchJourney: async (id) => {
    try {
      const res = await api.get(`/contacts/${id}/journey`);
      set({ journeyEvents: res.data.data || [] });
    } catch (err) {
      console.error('Failed to fetch customer journey', err);
    }
  },

  fetchCommunications: async (id) => {
    try {
      const res = await api.get(`/contacts/${id}/communications`);
      set({ communications: res.data.data || [] });
    } catch (err) {
      console.error('Failed to fetch communication logs', err);
    }
  },

  fetchCalls: async (id) => {
    try {
      const res = await api.get(`/contacts/${id}/calls`);
      set({ calls: res.data.data || [] });
    } catch (err) {
      console.error('Failed to fetch calls logs', err);
    }
  },

  fetchEmailsLogs: async (id) => {
    try {
      const res = await api.get(`/contacts/${id}/emails`);
      set({ emailsLogs: res.data.data || [] });
    } catch (err) {
      console.error('Failed to fetch emails logs', err);
    }
  },

  fetchMeetingsLogs: async (id) => {
    try {
      const res = await api.get(`/contacts/${id}/meetings`);
      set({ meetingsLogs: res.data.data || [] });
    } catch (err) {
      console.error('Failed to fetch meetings logs', err);
    }
  },

  fetchBusinessMetrics: async (id) => {
    try {
      const res = await api.get(`/contacts/${id}/business-value`);
      set({ businessMetrics: res.data.data || null });
    } catch (err) {
      console.error('Failed to fetch business metrics', err);
    }
  },

  fetchHealth: async (id) => {
    try {
      const res = await api.get(`/contacts/${id}/health`);
      set({ health: res.data.data || null });
    } catch (err) {
      console.error('Failed to fetch health metrics', err);
    }
  },

  fetchEngagementScore: async (id) => {
    try {
      const res = await api.get(`/contacts/${id}/engagement`);
      set({ engagementScore: res.data.data || null });
    } catch (err) {
      console.error('Failed to fetch engagement score', err);
    }
  },
}));

export default useContactStore;
