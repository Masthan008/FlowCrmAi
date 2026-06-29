import { api } from './api';
import type { CompanyFormData } from '../types/company';

const COMPANIES_URL = '/companies';

export const companyApi = {
  getCompanies: (params?: Record<string, any>) =>
    api.get(COMPANIES_URL, { params }),

  getCompany: (id: string) =>
    api.get(`${COMPANIES_URL}/${id}`),

  createCompany: (data: CompanyFormData) =>
    api.post(COMPANIES_URL, data),

  updateCompany: (id: string, data: Partial<CompanyFormData>) =>
    api.put(`${COMPANIES_URL}/${id}`, data),

  deleteCompany: (id: string) =>
    api.delete(`${COMPANIES_URL}/${id}`),

  bulkUpdateStatus: (ids: string[], status: string) =>
    api.patch(`${COMPANIES_URL}/status`, { ids, status }),

  bulkUpdateOwner: (ids: string[], ownerId: string) =>
    api.patch(`${COMPANIES_URL}/owner`, { ids, ownerId }),

  getStatistics: () =>
    api.get(`${COMPANIES_URL}/statistics`),

  getEmployees: () =>
    api.get(`${COMPANIES_URL}/employees`),

  getLifecycle: (id: string) => api.get(`${COMPANIES_URL}/${id}/lifecycle`),
  updateLifecycle: (id: string, data: any) => api.patch(`${COMPANIES_URL}/${id}/lifecycle`, data),
  getStageHistory: (id: string, params?: any) => api.get(`${COMPANIES_URL}/${id}/lifecycle/history`, { params }),
  getScore: (id: string) => api.get(`${COMPANIES_URL}/${id}/score`),
  calculateScore: (id: string) => api.post(`${COMPANIES_URL}/${id}/score/calculate`),
  getHealth: (id: string) => api.get(`${COMPANIES_URL}/${id}/health`),
  calculateHealth: (id: string) => api.post(`${COMPANIES_URL}/${id}/health/calculate`),
  getRisk: (id: string) => api.get(`${COMPANIES_URL}/${id}/risk`),
  calculateRisk: (id: string) => api.post(`${COMPANIES_URL}/${id}/risk/calculate`),
  getSegments: (params?: any) => api.get('/company-segments', { params }),
  createSegment: (data: any) => api.post('/company-segments', data),
  getSegment: (id: string) => api.get(`/company-segments/${id}`),
  updateSegment: (id: string, data: any) => api.put(`/company-segments/${id}`, data),
  deleteSegment: (id: string) => api.delete(`/company-segments/${id}`),
  evaluateSegment: (id: string) => api.post(`/company-segments/${id}/evaluate`),
  getTags: (params?: any) => api.get('/company-tags', { params }),
  createTag: (data: any) => api.post('/company-tags', data),
  updateTag: (id: string, data: any) => api.put(`/company-tags/${id}`, data),
  deleteTag: (id: string) => api.delete(`/company-tags/${id}`),
  getCompanyTags: (id: string) => api.get(`${COMPANIES_URL}/${id}/tags`),
  assignTags: (id: string, data: any) => api.post(`${COMPANIES_URL}/${id}/tags`, data),
  removeTag: (companyId: string, tagId: string) => api.delete(`${COMPANIES_URL}/${companyId}/tags/${tagId}`),
  getWorkflows: (params?: any) => api.get('/company-workflows', { params }),
  createWorkflow: (data: any) => api.post('/company-workflows', data),
  updateWorkflow: (id: string, data: any) => api.put(`/company-workflows/${id}`, data),
  deleteWorkflow: (id: string) => api.delete(`/company-workflows/${id}`),
  getRecommendations: (id: string, params?: any) => api.get(`${COMPANIES_URL}/${id}/recommendations`, { params }),
  createRecommendation: (id: string, data: any) => api.post(`${COMPANIES_URL}/${id}/recommendations`, data),
  markRecommendationRead: (id: string, recId: string) => api.patch(`${COMPANIES_URL}/${id}/recommendations/${recId}/read`),
  markRecommendationActioned: (id: string, recId: string) => api.patch(`${COMPANIES_URL}/${id}/recommendations/${recId}/action`),
  getFollowups: (id: string, params?: any) => api.get(`${COMPANIES_URL}/${id}/followups`, { params }),
  createFollowup: (id: string, data: any) => api.post(`${COMPANIES_URL}/${id}/followups`, data),
  updateFollowup: (id: string, followupId: string, data: any) => api.put(`${COMPANIES_URL}/${id}/followups/${followupId}`, data),
  deleteFollowup: (id: string, followupId: string) => api.delete(`${COMPANIES_URL}/${id}/followups/${followupId}`),
  getInsights: () => api.get('/company-insights'),
  getAnalytics: (params?: any) => api.get('/company-analytics', { params }),
};

export default companyApi;
