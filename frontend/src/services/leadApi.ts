import { api } from './api';
import type { LeadFormData } from '../types/lead';

const LEADS_URL = '/leads';

export const leadApi = {
  /**
   * Get paginated leads with filters
   */
  getLeads: (params?: Record<string, any>) =>
    api.get(LEADS_URL, { params }),

  /**
   * Get a single lead by ID
   */
  getLead: (id: string) =>
    api.get(`${LEADS_URL}/${id}`),

  /**
   * Create a new lead
   */
  createLead: (data: LeadFormData) =>
    api.post(LEADS_URL, data),

  /**
   * Update an existing lead
   */
  updateLead: (id: string, data: Partial<LeadFormData>) =>
    api.put(`${LEADS_URL}/${id}`, data),

  /**
   * Soft delete a lead
   */
  deleteLead: (id: string) =>
    api.delete(`${LEADS_URL}/${id}`),

  /**
   * Update lead status
   */
  updateStatus: (id: string, statusId: string) =>
    api.patch(`${LEADS_URL}/${id}/status`, { statusId }),

  /**
   * Update lead owner
   */
  updateOwner: (id: string, assignedToId: string) =>
    api.patch(`${LEADS_URL}/${id}/owner`, { assignedToId }),

  /**
   * Update lead priority
   */
  updatePriority: (id: string, priority: string) =>
    api.patch(`${LEADS_URL}/${id}/priority`, { priority }),

  /**
   * Update lead rating
   */
  updateRating: (id: string, rating: number) =>
    api.patch(`${LEADS_URL}/${id}/rating`, { rating }),

  /**
   * Get lead statistics
   */
  getStatistics: () =>
    api.get(`${LEADS_URL}/statistics`),

  /**
   * Get all lead sources (master data)
   */
  getSources: () =>
    api.get(`${LEADS_URL}/sources`),

  /**
   * Get all lead statuses (master data)
   */
  getStatuses: () =>
    api.get(`${LEADS_URL}/statuses`),

  /**
   * Get all employees (master data)
   */
  getEmployees: () =>
    api.get(`${LEADS_URL}/employees`),

  /**
   * Get comprehensive lead profile 360 view details
   */
  getProfile: (id: string) =>
    api.get(`${LEADS_URL}/${id}/profile`),

  /**
   * Notes endpoints
   */
  getNotes: (id: string) =>
    api.get(`${LEADS_URL}/${id}/notes`),
  createNote: (id: string, data: { title?: string; content: string; isPinned?: boolean }) =>
    api.post(`${LEADS_URL}/${id}/notes`, data),
  updateNote: (id: string, noteId: string, data: { title?: string; content: string; isPinned?: boolean }) =>
    api.put(`${LEADS_URL}/${id}/notes/${noteId}`, data),
  deleteNote: (id: string, noteId: string) =>
    api.delete(`${LEADS_URL}/${id}/notes/${noteId}`),

  /**
   * Activities endpoints
   */
  getActivities: (id: string, params?: Record<string, any>) =>
    api.get(`${LEADS_URL}/${id}/activities`, { params }),
  createActivity: (id: string, data: any) =>
    api.post(`${LEADS_URL}/${id}/activities`, data),
  updateActivity: (id: string, activityId: string, data: any) =>
    api.put(`${LEADS_URL}/${id}/activities/${activityId}`, data),
  deleteActivity: (id: string, activityId: string) =>
    api.delete(`${LEADS_URL}/${id}/activities/${activityId}`),

  /**
   * Files endpoints
   */
  getFiles: (id: string) =>
    api.get(`${LEADS_URL}/${id}/files`),
  getStorageSummary: (id: string) =>
    api.get(`${LEADS_URL}/${id}/files/summary`),
  uploadFile: (id: string, formData: FormData) =>
    api.post(`${LEADS_URL}/${id}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  deleteFile: (id: string, fileId: string) =>
    api.delete(`${LEADS_URL}/${id}/files/${fileId}`),

  /**
   * Timeline endpoints
   */
  getTimeline: (id: string, params?: Record<string, any>) =>
    api.get(`${LEADS_URL}/${id}/timeline`, { params }),

  /**
   * History endpoints
   */
  getHistory: (id: string, params?: Record<string, any>) =>
    api.get(`${LEADS_URL}/${id}/history`, { params }),
};

export default leadApi;
