import { apiClient, type ApiResponse } from '../../../libs/api-client';
import type {
  AppSociete,
  SocieteTerritory,
  PaginatedResult,
  CreateSocietePayload,
  UpdateSocietePayload,
} from './societes.types';

export const societesApi = {
  getAll: async (params?: { page?: number; limit?: number; type?: string }): Promise<PaginatedResult<AppSociete>> => {
    const res = await apiClient.get<ApiResponse<any>>('/societes', { params });
    const payload = res.data;
    if (Array.isArray(payload)) {
      return { data: payload, total: payload.length, page: 1, limit: payload.length, totalPages: 1 };
    }
    return {
      data:       Array.isArray(payload?.data) ? payload.data : [],
      total:      payload?.total      ?? 0,
      page:       payload?.page       ?? 1,
      limit:      payload?.limit      ?? 10,
      totalPages: payload?.totalPages ?? 1,
    };
  },

  getById: async (id: string): Promise<AppSociete> => {
    const res = await apiClient.get<ApiResponse<AppSociete>>(`/societes/${id}`);
    return res.data;
  },

  create: async (payload: CreateSocietePayload): Promise<AppSociete> => {
    const res = await apiClient.post<ApiResponse<AppSociete>>('/societes', payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateSocietePayload): Promise<AppSociete> => {
    const res = await apiClient.put<ApiResponse<AppSociete>>(`/societes/${id}`, payload);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/societes/${id}`);
  },

  getTerritories: async (id: string): Promise<SocieteTerritory[]> => {
    const res = await apiClient.get<ApiResponse<SocieteTerritory[]>>(`/societes/${id}/territories`);
    return Array.isArray(res.data) ? res.data : [];
  },
};
