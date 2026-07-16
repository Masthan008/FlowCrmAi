import { api } from './api';

const PLANS_URL = '/subscription-plans';
const SUBS_URL = '/subscriptions';

export const subscriptionApi = {
  listPlans: (params?: Record<string, any>) => api.get(PLANS_URL, { params }),
  createPlan: (data: any) => api.post(PLANS_URL, data),
  updatePlan: (id: string, data: any) => api.put(`${PLANS_URL}/${id}`, data),
  deletePlan: (id: string) => api.delete(`${PLANS_URL}/${id}`),
  list: (params?: Record<string, any>) => api.get(SUBS_URL, { params }),
  getById: (id: string) => api.get(`${SUBS_URL}/${id}`),
  create: (data: any) => api.post(SUBS_URL, data),
  update: (id: string, data: any) => api.put(`${SUBS_URL}/${id}`, data),
  delete: (id: string) => api.delete(`${SUBS_URL}/${id}`),
  pause: (id: string) => api.patch(`${SUBS_URL}/${id}/pause`),
  resume: (id: string) => api.patch(`${SUBS_URL}/${id}/resume`),
};

export default subscriptionApi;
