import { api } from './api';

const ARTICLES_URL = '/knowledge/articles';
const CATEGORIES_URL = '/knowledge/categories';

export const knowledgeApi = {
  listArticles: (params?: Record<string, any>) => api.get(ARTICLES_URL, { params }),
  getArticle: (id: string) => api.get(`${ARTICLES_URL}/${id}`),
  createArticle: (data: any) => api.post(ARTICLES_URL, data),
  updateArticle: (id: string, data: any) => api.put(`${ARTICLES_URL}/${id}`, data),
  deleteArticle: (id: string) => api.delete(`${ARTICLES_URL}/${id}`),
  publishArticle: (id: string) => api.patch(`${ARTICLES_URL}/${id}/publish`),
  archiveArticle: (id: string) => api.patch(`${ARTICLES_URL}/${id}/archive`),
  voteArticle: (id: string, vote: 'up' | 'down') => api.post(`${ARTICLES_URL}/${id}/vote`, { vote }),
  listCategories: (params?: Record<string, any>) => api.get(CATEGORIES_URL, { params }),
  createCategory: (data: any) => api.post(CATEGORIES_URL, data),
  updateCategory: (id: string, data: any) => api.put(`${CATEGORIES_URL}/${id}`, data),
  deleteCategory: (id: string) => api.delete(`${CATEGORIES_URL}/${id}`),
};

export default knowledgeApi;
