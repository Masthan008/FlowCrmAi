import { api } from './api';

const URL = '/contracts';

export const contractApi = {
  list: (params?: Record<string, any>) => api.get(URL, { params }),
  getById: (id: string) => api.get(`${URL}/${id}`),
  create: (data: any) => api.post(URL, data),
  update: (id: string, data: any) => api.put(`${URL}/${id}`, data),
  delete: (id: string) => api.delete(`${URL}/${id}`),
  approve: (id: string) => api.patch(`${URL}/${id}/approve`),
  renew: (id: string, data?: any) => api.post(`${URL}/${id}/renew`, data),
  terminate: (id: string) => api.patch(`${URL}/${id}/terminate`),
};

export default contractApi;
