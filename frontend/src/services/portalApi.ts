import { api } from './api';

const PORTAL_USERS_URL = '/portal/users';

export const portalApi = {
  getUsers: (params?: Record<string, any>) =>
    api.get(PORTAL_USERS_URL, { params }),

  getUser: (id: string) =>
    api.get(`${PORTAL_USERS_URL}/${id}`),

  createUser: (data: any) =>
    api.post(PORTAL_USERS_URL, data),

  updateUser: (id: string, data: any) =>
    api.put(`${PORTAL_USERS_URL}/${id}`, data),

  deleteUser: (id: string) =>
    api.delete(`${PORTAL_USERS_URL}/${id}`),
};

export default portalApi;
