import { api } from './api';

const COMMISSIONS_URL = '/commissions';

export const commissionApi = {
  getRules: (params?: Record<string, any>) =>
    api.get(`${COMMISSIONS_URL}/rules`, { params }),

  getRule: (id: string) =>
    api.get(`${COMMISSIONS_URL}/rules/${id}`),

  createRule: (data: any) =>
    api.post(`${COMMISSIONS_URL}/rules`, data),

  updateRule: (id: string, data: any) =>
    api.put(`${COMMISSIONS_URL}/rules/${id}`, data),

  deleteRule: (id: string) =>
    api.delete(`${COMMISSIONS_URL}/rules/${id}`),

  getPayouts: (params?: Record<string, any>) =>
    api.get(`${COMMISSIONS_URL}/payouts`, { params }),

  getPayout: (id: string) =>
    api.get(`${COMMISSIONS_URL}/payouts/${id}`),

  approvePayout: (id: string) =>
    api.patch(`${COMMISSIONS_URL}/payouts/${id}/approve`),

  payPayout: (id: string) =>
    api.patch(`${COMMISSIONS_URL}/payouts/${id}/pay`),

  calculateCommissions: (data: any) =>
    api.post(`${COMMISSIONS_URL}/calculate`, data),

  getDashboard: () =>
    api.get(`${COMMISSIONS_URL}/dashboard`),
};

export default commissionApi;
