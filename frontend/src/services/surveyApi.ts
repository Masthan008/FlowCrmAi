import { api } from './api';

const SURVEYS_URL = '/surveys';

export const surveyApi = {
  getSurveys: (params?: Record<string, any>) =>
    api.get(SURVEYS_URL, { params }),

  getSurvey: (id: string) =>
    api.get(`${SURVEYS_URL}/${id}`),

  createSurvey: (data: any) =>
    api.post(SURVEYS_URL, data),

  updateSurvey: (id: string, data: any) =>
    api.put(`${SURVEYS_URL}/${id}`, data),

  deleteSurvey: (id: string) =>
    api.delete(`${SURVEYS_URL}/${id}`),

  activateSurvey: (id: string) =>
    api.patch(`${SURVEYS_URL}/${id}/activate`),

  closeSurvey: (id: string) =>
    api.patch(`${SURVEYS_URL}/${id}/close`),

  getResponses: (id: string, params?: Record<string, any>) =>
    api.get(`${SURVEYS_URL}/${id}/responses`, { params }),

  getAnalytics: (id: string) =>
    api.get(`${SURVEYS_URL}/${id}/analytics`),
};

export default surveyApi;
