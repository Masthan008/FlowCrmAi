import { api } from './api';

const URL = '/tickets';

export const ticketApi = {
  list: (params?: Record<string, any>) => api.get(URL, { params }),
  getById: (id: string) => api.get(`${URL}/${id}`),
  create: (data: any) => api.post(URL, data),
  update: (id: string, data: any) => api.put(`${URL}/${id}`, data),
  delete: (id: string) => api.delete(`${URL}/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`${URL}/${id}/status`, { status }),
  updatePriority: (id: string, priority: string) => api.patch(`${URL}/${id}/priority`, { priority }),
  assign: (id: string, assignedToId: string) => api.patch(`${URL}/${id}/assign`, { assignedToId }),
  listComments: (ticketId: string) => api.get(`${URL}/${ticketId}/comments`),
  createComment: (ticketId: string, data: any) => api.post(`${URL}/${ticketId}/comments`, data),
  deleteComment: (ticketId: string, commentId: string) => api.delete(`${URL}/${ticketId}/comments/${commentId}`),
  listAttachments: (ticketId: string) => api.get(`${URL}/${ticketId}/attachments`),
  uploadAttachment: (ticketId: string, formData: FormData) =>
    api.post(`${URL}/${ticketId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteAttachment: (ticketId: string, attachmentId: string) =>
    api.delete(`${URL}/${ticketId}/attachments/${attachmentId}`),
  listTimeLogs: (ticketId: string) => api.get(`${URL}/${ticketId}/time-logs`),
  createTimeLog: (ticketId: string, data: any) => api.post(`${URL}/${ticketId}/time-logs`, data),
  getStatistics: () => api.get(`${URL}/statistics`),
};

export default ticketApi;
