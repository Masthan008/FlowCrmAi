import { api } from './api';
import type { ContactFormData } from '../types/contact';

const CONTACTS_URL = '/contacts';

export const contactApi = {
  /**
   * Get paginated contacts with filters
   */
  getContacts: (params?: Record<string, any>) =>
    api.get(CONTACTS_URL, { params }),

  /**
   * Get a single contact by ID
   */
  getContact: (id: string) =>
    api.get(`${CONTACTS_URL}/${id}`),

  /**
   * Create a new contact
   */
  createContact: (data: ContactFormData) =>
    api.post(CONTACTS_URL, data),

  /**
   * Update an existing contact
   */
  updateContact: (id: string, data: Partial<ContactFormData>) =>
    api.put(`${CONTACTS_URL}/${id}`, data),

  /**
   * Soft delete a contact
   */
  deleteContact: (id: string) =>
    api.delete(`${CONTACTS_URL}/${id}`),

  /**
   * Bulk update contact statuses
   */
  bulkUpdateStatus: (ids: string[], status: string) =>
    api.patch(`${CONTACTS_URL}/status`, { ids, status }),

  /**
   * Bulk update contact owners
   */
  bulkUpdateOwner: (ids: string[], ownerId: string) =>
    api.patch(`${CONTACTS_URL}/owner`, { ids, ownerId }),

  /**
   * Get contact statistics
   */
  getStatistics: () =>
    api.get(`${CONTACTS_URL}/statistics`),
};

export default contactApi;
