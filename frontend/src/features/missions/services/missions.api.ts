import { apiClient, type ApiResponse } from '../../../libs/api-client';
import type {
  Mission,
  MissionChecklistItem,
  MissionAssignment,
  MissionStatusHistory,
  PaginatedResult,
  CreateMissionPayload,
  UpdateMissionPayload,
} from './missions.types';

const BASE = '/missions';

export const missionsApi = {
  // ── Liste paginée — GET /missions ──────────────────────────────────────────
  getMissions: async (params?: Record<string, any>): Promise<PaginatedResult<Mission>> => {
    const res = await apiClient.get<ApiResponse<any>>(BASE, { params });
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

  // ── Détail — GET /missions/:id ─────────────────────────────────────────────
  getMissionById: async (id: string): Promise<Mission> => {
    const res = await apiClient.get<ApiResponse<Mission>>(`${BASE}/${id}`);
    return res.data;
  },

  // ── Création — POST /missions ──────────────────────────────────────────────
  createMission: async (payload: CreateMissionPayload): Promise<Mission> => {
    const res = await apiClient.post<ApiResponse<Mission>>(BASE, payload);
    return res.data;
  },

  // ── Mise à jour — PUT /missions/:id ───────────────────────────────────────
  updateMission: async (id: string, payload: UpdateMissionPayload): Promise<Mission> => {
    const res = await apiClient.put<ApiResponse<Mission>>(`${BASE}/${id}`, payload);
    return res.data;
  },

  // ── Suppression logique — DELETE /missions/:id ────────────────────────────
  deleteMission: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },

  // ── Checklist — GET /missions/:id/checklist ───────────────────────────────
  getMissionChecklist: async (missionId: string): Promise<MissionChecklistItem[]> => {
    const res = await apiClient.get<ApiResponse<MissionChecklistItem[]>>(`${BASE}/${missionId}/checklist`);
    return Array.isArray(res.data) ? res.data : [];
  },

  // ── Ajout tâche checklist — POST /missions/:id/checklist ──────────────────
  addChecklistItem: async (missionId: string, label: string): Promise<MissionChecklistItem> => {
    const res = await apiClient.post<ApiResponse<MissionChecklistItem>>(`${BASE}/${missionId}/checklist`, { label });
    return res.data;
  },

  // ── Assigner un utilisateur — POST /missions/:id/assignees ────────────────
  assignUser: async (missionId: string, userId: string): Promise<MissionAssignment> => {
    const res = await apiClient.post<ApiResponse<MissionAssignment>>(`${BASE}/${missionId}/assignees`, { userId });
    return res.data;
  },

  // ── Historique statuts — GET /missions/:id/status-history ─────────────────
  getStatusHistory: async (missionId: string): Promise<MissionStatusHistory[]> => {
    const res = await apiClient.get<ApiResponse<MissionStatusHistory[]>>(`${BASE}/${missionId}/status-history`);
    return Array.isArray(res.data) ? res.data : [];
  },
};
