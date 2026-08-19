import { apiClient, type ApiResponse } from '../../../libs/api-client';
import type {
  FieldTeam,
  FieldTeamMember,
  PaginatedResult,
  CreateTeamPayload,
  UpdateTeamPayload,
  AddTeamMemberPayload,
} from './teams.types';

export const teamsApi = {
  getAll: async (params?: { page?: number; limit?: number; teamType?: string; organizationId?: string }): Promise<PaginatedResult<FieldTeam>> => {
    const res = await apiClient.get<ApiResponse<any>>('/teams', { params });
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

  getById: async (id: string): Promise<FieldTeam> => {
    const res = await apiClient.get<ApiResponse<FieldTeam>>(`/teams/${id}`);
    return res.data;
  },

  create: async (payload: CreateTeamPayload): Promise<FieldTeam> => {
    const res = await apiClient.post<ApiResponse<FieldTeam>>('/teams', payload);
    return res.data;
  },

  update: async (id: string, payload: UpdateTeamPayload): Promise<FieldTeam> => {
    const res = await apiClient.put<ApiResponse<FieldTeam>>(`/teams/${id}`, payload);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/teams/${id}`);
  },

  getMembers: async (id: string): Promise<FieldTeamMember[]> => {
    const res = await apiClient.get<ApiResponse<FieldTeamMember[]>>(`/teams/${id}/members`);
    return Array.isArray(res.data) ? res.data : [];
  },

  addMember: async (id: string, payload: AddTeamMemberPayload): Promise<FieldTeamMember> => {
    // Le backend crée l'utilisateur puis l'ajoute à l'équipe
    const res = await apiClient.post<ApiResponse<FieldTeamMember>>(`/teams/${id}/members`, {
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone || undefined,
      role: payload.roleInTeam,
      organizationId: payload.organizationId || null,
    });
    return res.data;
  },

  removeMember: async (id: string, memberId: string): Promise<void> => {
    await apiClient.delete(`/teams/${id}/members/${memberId}`);
  },
};
