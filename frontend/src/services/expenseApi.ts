import { api } from './api';

const EXPENSES_URL = '/expenses';

export const expenseApi = {
  getExpenses: (params?: Record<string, any>) =>
    api.get(EXPENSES_URL, { params }),

  getExpense: (id: string) =>
    api.get(`${EXPENSES_URL}/${id}`),

  createExpense: (data: any) =>
    api.post(EXPENSES_URL, data),

  updateExpense: (id: string, data: any) =>
    api.put(`${EXPENSES_URL}/${id}`, data),

  deleteExpense: (id: string) =>
    api.delete(`${EXPENSES_URL}/${id}`),

  approveExpense: (id: string) =>
    api.patch(`${EXPENSES_URL}/${id}/approve`),

  reimburseExpense: (id: string) =>
    api.patch(`${EXPENSES_URL}/${id}/reimburse`),

  rejectExpense: (id: string) =>
    api.patch(`${EXPENSES_URL}/${id}/reject`),

  getCategories: (params?: Record<string, any>) =>
    api.get(`${EXPENSES_URL}/categories`, { params }),

  createCategory: (data: any) =>
    api.post(`${EXPENSES_URL}/categories`, data),

  updateCategory: (id: string, data: any) =>
    api.put(`${EXPENSES_URL}/categories/${id}`, data),

  deleteCategory: (id: string) =>
    api.delete(`${EXPENSES_URL}/categories/${id}`),

  getStatistics: () =>
    api.get(`${EXPENSES_URL}/statistics`),
};

export default expenseApi;
