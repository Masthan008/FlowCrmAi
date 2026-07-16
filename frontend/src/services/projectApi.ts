import { api } from './api';

const URL = '/projects';

export const projectApi = {
  list: (params?: Record<string, any>) => api.get(URL, { params }),
  getById: (id: string) => api.get(`${URL}/${id}`),
  create: (data: any) => api.post(URL, data),
  update: (id: string, data: any) => api.put(`${URL}/${id}`, data),
  delete: (id: string) => api.delete(`${URL}/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`${URL}/${id}/status`, { status }),
  listMilestones: (projectId: string) => api.get(`${URL}/${projectId}/milestones`),
  createMilestone: (projectId: string, data: any) => api.post(`${URL}/${projectId}/milestones`, data),
  updateMilestone: (projectId: string, milestoneId: string, data: any) =>
    api.put(`${URL}/${projectId}/milestones/${milestoneId}`, data),
  deleteMilestone: (projectId: string, milestoneId: string) =>
    api.delete(`${URL}/${projectId}/milestones/${milestoneId}`),
  listMembers: (projectId: string) => api.get(`${URL}/${projectId}/members`),
  addMember: (projectId: string, data: any) => api.post(`${URL}/${projectId}/members`, data),
  removeMember: (projectId: string, memberId: string) =>
    api.delete(`${URL}/${projectId}/members/${memberId}`),
};

export default projectApi;
