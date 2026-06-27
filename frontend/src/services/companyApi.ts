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
};

export default companyApi;
