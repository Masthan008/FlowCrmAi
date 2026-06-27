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
};

export default leadApi;
