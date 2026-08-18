import { apiClient, type ApiResponse } from '../../../libs/api-client';
import type {
  Structure,
  PaginatedResult,
  CreateStructurePayload,
  UpdateStructurePayload,
} from './structures.types';

export const structuresApi = {
  getAll: async (params?: { page?: number; limit?: number; territoryId?: string; type?: string; status?: string; condition?: string; search?: string }): Promise<PaginatedResult<Structure>> => {
    const res = await apiClient.get<ApiResponse<any>>('/infrastructures', { params });
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

  getById: async (id: string): Promise<Structure> => {
    const res = await apiClient.get<ApiResponse<Structure>>(`/infrastructures/${id}`);
    return res.data;
  },

  create: async (payload: CreateStructurePayload): Promise<Structure> => {
    const res = await apiClient.post<ApiResponse<Structure>>('/infrastructures', payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateStructurePayload): Promise<Structure> => {
    const res = await apiClient.put<ApiResponse<Structure>>(`/infrastructures/${id}`, payload);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/infrastructures/${id}`);
  },
};