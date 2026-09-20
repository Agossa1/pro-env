import { apiClient, type ApiResponse } from '../../../libs/api-client';
import type { AppUser, PaginatedUsersResult, CreateUserDto, UpdateUserDto } from './users.types';

const BASE = '/auth/users';

export async function fetchUsers(
  page = 1,
  limit = 50,
): Promise<PaginatedUsersResult> {
  const res = await apiClient.get<ApiResponse<any>>(BASE, {
    params: { page, limit },
  });

  return {
    data:       Array.isArray(res.data) ? res.data : [],
    total:      res.pagination?.total ?? (Array.isArray(res.data) ? res.data.length : 0),
    page:       res.pagination?.page ?? page,
    limit:      res.pagination?.limit ?? limit,
    totalPages: res.pagination?.totalPages ?? 1,
  };
}

export async function createUser(dto: CreateUserDto): Promise<AppUser> {
  const res = await apiClient.post<ApiResponse<AppUser>>('/auth/register-admin', dto);
  return res.data;
}

export async function toggleUserActive(id: string): Promise<{ isActive: boolean }> {
  const res = await apiClient.patch<ApiResponse<{ isActive: boolean }>>(`/auth/users/${id}/toggle-active`);
  return res.data;
}

export async function updateUser(dto: UpdateUserDto): Promise<void> {
  const { id, ...payload } = dto;
  await apiClient.put<ApiResponse<void>>(`/auth/users/${id}`, payload);
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete<ApiResponse<void>>(`/auth/users/${id}`);
}