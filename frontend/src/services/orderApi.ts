import { api } from './api';

const URL = '/orders';

export const orderApi = {
  list: (params?: Record<string, any>) => api.get(URL, { params }),
  getById: (id: string) => api.get(`${URL}/${id}`),
  create: (data: any) => api.post(URL, data),
  update: (id: string, data: any) => api.put(`${URL}/${id}`, data),
  delete: (id: string) => api.delete(`${URL}/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`${URL}/${id}/status`, { status }),
};

export default orderApi;
