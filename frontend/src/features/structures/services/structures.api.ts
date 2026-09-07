import { apiClient, getAccessToken, type ApiResponse } from '../../../libs/api-client';
import type {
  Structure,
  StructureMedia,
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

  // ── Media (photos) ────────────────────────────────────────────────────

  /** Récupère toutes les photos associées à une structure */
  getPhotos: async (structureId: string): Promise<StructureMedia[]> => {
    const res = await apiClient.get<ApiResponse<StructureMedia[]>>(`/media/entity/${structureId}`);
    return res.data ?? [];
  },

  /**
   * Upload une photo et l'associe à une structure.
   * Utilise FormData (multipart) avec le module media backend (Cloudinary).
   */
  uploadPhoto: async (structureId: string, file: File): Promise<StructureMedia> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('module', 'infrastructure');
    formData.append('entityId', structureId);

    // On utilise fetch directement pour avoir la progression et pour construire
    // le header Authorization manuellement (FormData ne doit pas avoir Content-Type).
    const token = getAccessToken();
    const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
    const response = await fetch(`${BASE_URL}/media/upload`, {
      method: 'POST',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      let msg = 'Erreur lors de l\'upload.';
      try { msg = JSON.parse(text)?.message ?? msg; } catch {}
      throw new Error(msg);
    }

    const json = await response.json() as ApiResponse<StructureMedia>;
    return json.data;
  },

  /** Supprime une photo (BDD + Cloudinary) */
  deletePhoto: async (mediaId: string): Promise<void> => {
    await apiClient.delete(`/media/${mediaId}`);
  },
};