import { api } from './api';

const DEALS_URL = '/deals';

export const dealApi = {
  // --- Existing CRUD ---
  getDeals: (params?: Record<string, any>) => api.get(DEALS_URL, { params }),
  getDeal: (id: string) => api.get(`${DEALS_URL}/${id}`),
  createDeal: (data: any) => api.post(DEALS_URL, data),
  updateDeal: (id: string, data: any) => api.put(`${DEALS_URL}/${id}`, data),
  deleteDeal: (id: string) => api.delete(`${DEALS_URL}/${id}`),
  bulkUpdateStatus: (ids: string[], status: string) => api.patch(`${DEALS_URL}/status`, { ids, status }),
  updateStage: (id: string, stageId: string) => api.patch(`${DEALS_URL}/stage`, { id, stageId }),
  bulkUpdateOwner: (ids: string[], ownerId: string) => api.patch(`${DEALS_URL}/owner`, { ids, ownerId }),
  getStatistics: () => api.get(`${DEALS_URL}/statistics`),

  // --- Pipeline CRUD ---
  getPipelines: () => api.get(`${DEALS_URL}/pipeline`),
  getPipeline: (id: string) => api.get(`${DEALS_URL}/pipeline/${id}`),
  createPipeline: (data: any) => api.post(`${DEALS_URL}/pipeline`, data),
  updatePipeline: (id: string, data: any) => api.put(`${DEALS_URL}/pipeline/${id}`, data),
  deletePipeline: (id: string) => api.delete(`${DEALS_URL}/pipeline/${id}`),
  duplicatePipeline: (id: string) => api.post(`${DEALS_URL}/pipeline/${id}/duplicate`),

  // --- Kanban Board ---
  getKanban: (params?: Record<string, any>) => api.get(`${DEALS_URL}/kanban`, { params }),

  // --- Move Stage (Drag & Drop) ---
  moveStage: (id: string, toStageId: string) => api.patch(`${DEALS_URL}/${id}/move-stage`, { toStageId }),

  // --- Forecast ---
  getForecast: (params?: Record<string, any>) => api.get(`${DEALS_URL}/forecast`, { params }),

  // --- Analytics ---
  getAnalytics: (params?: Record<string, any>) => api.get(`${DEALS_URL}/analytics`, { params }),

  // --- KPIs ---
  getKpis: (params?: Record<string, any>) => api.get(`${DEALS_URL}/kpis`, { params }),

  // --- Funnel ---
  getFunnel: (params?: Record<string, any>) => api.get(`${DEALS_URL}/funnel`, { params }),

  // --- Aging ---
  getAging: (params?: Record<string, any>) => api.get(`${DEALS_URL}/aging`, { params }),

  // --- Pipeline Health ---
  getPipelineHealth: (params?: Record<string, any>) => api.get(`${DEALS_URL}/pipeline-health`, { params }),

  // --- Quotas ---
  getQuotas: (params?: Record<string, any>) => api.get(`${DEALS_URL}/quotas`, { params }),
  createQuota: (data: any) => api.post(`${DEALS_URL}/quotas`, data),
  updateQuota: (id: string, data: any) => api.put(`${DEALS_URL}/quotas/${id}`, data),
  deleteQuota: (id: string) => api.delete(`${DEALS_URL}/quotas/${id}`),

  // --- Team Performance ---
  getPerformance: (params?: Record<string, any>) => api.get(`${DEALS_URL}/performance`, { params }),

  // --- Saved Pipeline Views ---
  getPipelineViews: (params?: Record<string, any>) => api.get(`${DEALS_URL}/pipeline-views`, { params }),
  createPipelineView: (data: any) => api.post(`${DEALS_URL}/pipeline-views`, data),
  deletePipelineView: (id: string) => api.delete(`${DEALS_URL}/pipeline-views/${id}`),
};
