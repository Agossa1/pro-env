import { apiClient, type ApiResponse } from '../../../libs/api-client';
import type {
  Report,
  PaginatedResult,
  CreateReportPayload,
  UpdateReportPayload,
} from './reports.types';

const BASE = '/reports';

export interface ReportMedia {
  id: string;
  module: string | null;
  entityId: string | null;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string; // URL Cloudinary
  publicId: string;
  uploadedBy: string | null;
  createdAt: string;
}

export const reportsApi = {
  getReports: async (params?: Record<string, any>): Promise<PaginatedResult<Report>> => {
    const res = await apiClient.get<ApiResponse<any>>(BASE, { params });
    const payload = res.data;
    // Support both flat array and paginated object from backend
    if (Array.isArray(payload)) {
      return { data: payload, total: payload.length, page: 1, limit: payload.length, totalPages: 1 };
    }
    return {
      data:       Array.isArray(payload?.data) ? payload.data : [],
      total:      payload?.total ?? 0,
      page:       payload?.page ?? 1,
      limit:      payload?.limit ?? 10,
      totalPages: payload?.totalPages ?? 1,
    };
  },

  getReportById: async (id: string): Promise<Report> => {
    const res = await apiClient.get<ApiResponse<Report>>(`${BASE}/${id}`);
    return res.data;
  },

  getReportDetails: async (reportId: string): Promise<any | null> => {
    const res = await apiClient.get<ApiResponse<any>>(`${BASE}/${reportId}/details`);
    return res.data?.data ?? null;
  },

  createReport: async (payload: CreateReportPayload): Promise<Report> => {
    const res = await apiClient.post<ApiResponse<Report>>(BASE, payload);
    return res.data;
  },

  updateReport: async (id: string, payload: UpdateReportPayload): Promise<Report> => {
    const res = await apiClient.put<ApiResponse<Report>>(`${BASE}/${id}`, payload);
    return res.data;
  },

  deleteReport: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },

  async uploadReportMedia(reportId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('module', 'REPORTS');
    formData.append('entityId', reportId);

    await apiClient.post<ApiResponse<null>>('/media/upload', formData);
  },

  getReportMedia: async (reportId: string): Promise<ReportMedia[]> => {
    const res = await apiClient.get<ApiResponse<ReportMedia[]>>(`/media/entity/${reportId}`);
    // apiClient retourne le corps brut JSON : { success, message, data: [...] }
    // donc res.data est directement le tableau de médias
    const data = Array.isArray(res.data) ? res.data : [];
    return data.filter((m: ReportMedia) => m.mimeType?.startsWith('image/'));
  },
};
