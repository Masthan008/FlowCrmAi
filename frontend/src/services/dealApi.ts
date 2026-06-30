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

  // --- Deal Workspace Products CRUD ---
  getDealProducts: (dealId: string, search?: string) => api.get(`${DEALS_URL}/${dealId}/products`, { params: { search } }),
  addDealProduct: (dealId: string, data: any) => api.post(`${DEALS_URL}/${dealId}/products`, data),
  updateDealProduct: (productId: string, data: any) => api.put(`${DEALS_URL}/products/${productId}`, data), // wait, let's verify our route format:
  // Route was registered as PUT /:id/products/:productId but wait, in our routes we did:
  // router.put('/:id/products/:productId', dealWorkspaceController.updateProductLine);
  // So it needs both :id and :productId. Let's make it:
  updateDealProductLine: (dealId: string, productId: string, data: any) => api.put(`${DEALS_URL}/${dealId}/products/${productId}`, data),
  deleteDealProductLine: (dealId: string, productId: string) => api.delete(`${DEALS_URL}/${dealId}/products/${productId}`),

  // --- Deal Workspace Quotes ---
  getDealQuotes: (dealId: string, search?: string) => api.get(`${DEALS_URL}/${dealId}/quotes`, { params: { search } }),
  createDealQuote: (dealId: string, data: any) => api.post(`${DEALS_URL}/${dealId}/quotes`, data),
  updateDealQuote: (dealId: string, quoteId: string, data: any) => api.put(`${DEALS_URL}/${dealId}/quotes/${quoteId}`, data),
  approveDealQuote: (dealId: string, quoteId: string) => api.patch(`${DEALS_URL}/${dealId}/quotes/${quoteId}/approve`),
  rejectDealQuote: (dealId: string, quoteId: string) => api.patch(`${DEALS_URL}/${dealId}/quotes/${quoteId}/reject`),

  // --- Deal Workspace Competitors ---
  getDealCompetitors: (dealId: string, search?: string) => api.get(`${DEALS_URL}/${dealId}/competitors`, { params: { search } }),
  createDealCompetitor: (dealId: string, data: any) => api.post(`${DEALS_URL}/${dealId}/competitors`, data),

  // --- Deal Workspace Collaboration & Comments ---
  getDealCollaboration: (dealId: string) => api.get(`${DEALS_URL}/${dealId}/collaboration`),
  createDealComment: (dealId: string, data: any) => api.post(`${DEALS_URL}/${dealId}/comments`, data),

  // --- Deal Workspace Checklist ---
  getDealChecklist: (dealId: string) => api.get(`${DEALS_URL}/${dealId}/checklist`),
  updateDealChecklistItem: (dealId: string, itemId: string, isCompleted: boolean) => api.patch(`${DEALS_URL}/${dealId}/checklist/${itemId}`, { isCompleted }),

  // --- Deal Workspace Negotiations ---
  getDealNegotiations: (dealId: string) => api.get(`${DEALS_URL}/${dealId}/negotiations`),
  createDealNegotiation: (dealId: string, data: any) => api.post(`${DEALS_URL}/${dealId}/negotiations`, data),

  // --- Deal Intelligence & Automation ---
  getDealScore: (dealId: string) => api.get(`${DEALS_URL}/${dealId}/score`),
  getDealWinProbability: (dealId: string) => api.get(`${DEALS_URL}/${dealId}/win-probability`),
  getDealHealth: (dealId: string) => api.get(`${DEALS_URL}/${dealId}/health`),
  getDealRisk: (dealId: string) => api.get(`${DEALS_URL}/${dealId}/risk`),
  getDealRecommendations: (dealId: string) => api.get(`${DEALS_URL}/${dealId}/recommendations`),
  getDealSLA: (dealId: string) => api.get(`${DEALS_URL}/${dealId}/sla`),
  updateDealLifecycle: (dealId: string, data: any) => api.patch(`${DEALS_URL}/${dealId}/lifecycle`, data),
  getDealPlaybooks: (dealId: string) => api.get(`${DEALS_URL}/${dealId}/playbooks`),
  getDealFollowups: (dealId: string) => api.get(`${DEALS_URL}/${dealId}/followups`),
  createDealFollowup: (dealId: string, data: any) => api.post(`${DEALS_URL}/${dealId}/followups`, data),

  // --- CRM Workflows & Insights ---
  getWorkflows: (module?: string) => api.get('/deal-workflows', { params: { module } }),
  createWorkflow: (data: any) => api.post('/deal-workflows', data),
  getExecutiveInsights: () => api.get(`${DEALS_URL}/executive-insights`),
};
