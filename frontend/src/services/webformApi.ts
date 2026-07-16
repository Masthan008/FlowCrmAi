import { api } from './api';

const FORMS_URL = '/webforms';

export const webformApi = {
  getForms: (params?: Record<string, any>) =>
    api.get(FORMS_URL, { params }),

  getForm: (id: string) =>
    api.get(`${FORMS_URL}/${id}`),

  createForm: (data: any) =>
    api.post(FORMS_URL, data),

  updateForm: (id: string, data: any) =>
    api.put(`${FORMS_URL}/${id}`, data),

  deleteForm: (id: string) =>
    api.delete(`${FORMS_URL}/${id}`),

  activateForm: (id: string) =>
    api.patch(`${FORMS_URL}/${id}/activate`),

  deactivateForm: (id: string) =>
    api.patch(`${FORMS_URL}/${id}/deactivate`),

  getSubmissions: (id: string, params?: Record<string, any>) =>
    api.get(`${FORMS_URL}/${id}/submissions`, { params }),

  getEmbedCode: (id: string) =>
    api.get(`${FORMS_URL}/${id}/embed`),
};

export default webformApi;
