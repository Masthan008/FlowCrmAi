import { api } from './api';

const URL = '/email';

export const emailApi = {
  listAccounts: (params?: Record<string, any>) => api.get(`${URL}/accounts`, { params }),
  createAccount: (data: any) => api.post(`${URL}/accounts`, data),
  updateAccount: (id: string, data: any) => api.put(`${URL}/accounts/${id}`, data),
  deleteAccount: (id: string) => api.delete(`${URL}/accounts/${id}`),
  sync: () => api.post(`${URL}/sync`),
  listMessages: (params?: Record<string, any>) => api.get(`${URL}/messages`, { params }),
  getMessage: (id: string) => api.get(`${URL}/messages/${id}`),
  markRead: (id: string) => api.patch(`${URL}/messages/${id}/read`),
  toggleStar: (id: string) => api.patch(`${URL}/messages/${id}/star`),
  send: (data: any) => api.post(`${URL}/send`, data),
};

export default emailApi;
