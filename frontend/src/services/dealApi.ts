import { api } from './api';

const DEALS_URL = '/deals';

export const dealApi = {
  getDeals: (params?: Record<string, any>) => api.get(DEALS_URL, { params }),
  getDeal: (id: string) => api.get(`${DEALS_URL}/${id}`),
  createDeal: (data: any) => api.post(DEALS_URL, data),
  updateDeal: (id: string, data: any) => api.put(`${DEALS_URL}/${id}`, data),
  deleteDeal: (id: string) => api.delete(`${DEALS_URL}/${id}`),
  bulkUpdateStatus: (ids: string[], status: string) => api.patch(`${DEALS_URL}/status`, { ids, status }),
  updateStage: (id: string, stageId: string) => api.patch(`${DEALS_URL}/stage`, { id, stageId }),
  bulkUpdateOwner: (ids: string[], ownerId: string) => api.patch(`${DEALS_URL}/owner`, { ids, ownerId }),
  getStatistics: () => api.get(`${DEALS_URL}/statistics`),
};
