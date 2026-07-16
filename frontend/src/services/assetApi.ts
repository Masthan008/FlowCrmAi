import { api } from './api';

const ASSETS_URL = '/assets';

export const assetApi = {
  getAssets: (params?: Record<string, any>) =>
    api.get(ASSETS_URL, { params }),

  getAsset: (id: string) =>
    api.get(`${ASSETS_URL}/${id}`),

  createAsset: (data: any) =>
    api.post(ASSETS_URL, data),

  updateAsset: (id: string, data: any) =>
    api.put(`${ASSETS_URL}/${id}`, data),

  deleteAsset: (id: string) =>
    api.delete(`${ASSETS_URL}/${id}`),

  assignAsset: (id: string, data: any) =>
    api.patch(`${ASSETS_URL}/${id}/assign`, data),

  retireAsset: (id: string) =>
    api.patch(`${ASSETS_URL}/${id}/retire`),
};

export default assetApi;
