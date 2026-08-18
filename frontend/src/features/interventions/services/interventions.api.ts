import { apiClient, type ApiResponse } from '../../../libs/api-client';
import type {
  Intervention,
  FieldInterventionReport,
  PaginatedResult,
  CreateInterventionPayload,
  UpdateInterventionPayload,
  CreateFieldReportPayload,
} from './interventions.types';

export const interventionsApi = {
  getAll: async (params?: { page?: number; limit?: number; status?: string; missionId?: string; teamId?: string }): Promise<PaginatedResult<Intervention>> => {
    const res = await apiClient.get<ApiResponse<any>>('/interventions', { params });
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

  getById: async (id: string): Promise<Intervention> => {
    const res = await apiClient.get<ApiResponse<Intervention>>(`/interventions/${id}`);
    return res.data;
  },

  create: async (payload: CreateInterventionPayload): Promise<Intervention> => {
    const res = await apiClient.post<ApiResponse<Intervention>>('/interventions', payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateInterventionPayload): Promise<Intervention> => {
    const res = await apiClient.put<ApiResponse<Intervention>>(`/interventions/${id}`, payload);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/interventions/${id}`);
  },

  getReports: async (id: string): Promise<FieldInterventionReport[]> => {
    const res = await apiClient.get<ApiResponse<FieldInterventionReport[]>>(`/interventions/${id}/reports`);
    return Array.isArray(res.data) ? res.data : [];
  },

  createReport: async (id: string, payload: Omit<CreateFieldReportPayload, 'interventionId'>): Promise<FieldInterventionReport> => {
    const res = await apiClient.post<ApiResponse<FieldInterventionReport>>(`/interventions/${id}/reports`, payload);
    return res.data;
  },
};