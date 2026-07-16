import { api } from './api';

const URL = '/campaigns';

export const campaignApi = {
  list: (params?: Record<string, any>) => api.get(URL, { params }),
  getById: (id: string) => api.get(`${URL}/${id}`),
  create: (data: any) => api.post(URL, data),
  update: (id: string, data: any) => api.put(`${URL}/${id}`, data),
  delete: (id: string) => api.delete(`${URL}/${id}`),
  launch: (id: string) => api.patch(`${URL}/${id}/launch`),
  pause: (id: string) => api.patch(`${URL}/${id}/pause`),
  listLists: (campaignId: string) => api.get(`${URL}/${campaignId}/lists`),
  createList: (campaignId: string, data: any) => api.post(`${URL}/${campaignId}/lists`, data),
  deleteList: (campaignId: string, listId: string) => api.delete(`${URL}/${campaignId}/lists/${listId}`),
  listEmails: (campaignId: string) => api.get(`${URL}/${campaignId}/emails`),
  createEmail: (campaignId: string, data: any) => api.post(`${URL}/${campaignId}/emails`, data),
  updateEmail: (campaignId: string, emailId: string, data: any) => api.put(`${URL}/${campaignId}/emails/${emailId}`, data),
  deleteEmail: (campaignId: string, emailId: string) => api.delete(`${URL}/${campaignId}/emails/${emailId}`),
  getAnalytics: (id: string) => api.get(`${URL}/${id}/analytics`),
};

export default campaignApi;
