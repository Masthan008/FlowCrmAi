import { api } from './api';

const GDPR_URL = '/gdpr';

export const gdprApi = {
  getConsentLogs: (params?: Record<string, any>) =>
    api.get(`${GDPR_URL}/consent`, { params }),

  recordConsent: (data: any) =>
    api.post(`${GDPR_URL}/consent`, data),

  revokeConsent: (id: string) =>
    api.patch(`${GDPR_URL}/consent/${id}/revoke`),

  getDataRequests: (params?: Record<string, any>) =>
    api.get(`${GDPR_URL}/requests`, { params }),

  createDataRequest: (data: any) =>
    api.post(`${GDPR_URL}/requests`, data),

  processDataRequest: (id: string) =>
    api.patch(`${GDPR_URL}/requests/${id}/process`),

  completeDataRequest: (id: string) =>
    api.patch(`${GDPR_URL}/requests/${id}/complete`),

  rejectDataRequest: (id: string) =>
    api.patch(`${GDPR_URL}/requests/${id}/reject`),
};

export default gdprApi;
