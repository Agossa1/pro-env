/*
 * |--------------------------------------------------------------------------
 * | PERMISSIONS API
 * |--------------------------------------------------------------------------
 * | Couche d'appels HTTP vers le module /api/permissions du backend.
 * |--------------------------------------------------------------------------
 */

import { apiClient, type ApiResponse } from '../../../libs/api-client';
import type {
  Permission,
  PaginatedPermissionsResult,
  RoleWithPermissions,
  CreatePermissionDto,
  UpdatePermissionDto,
  AssignPermissionsDto,
} from './permissions.types';

const BASE = '/permissions';

// ─────────────────────────────────────────────────────────────────────────────
// Permissions CRUD
// ─────────────────────────────────────────────────────────────────────────────

/** Liste paginée de toutes les permissions. */
export async function fetchPermissions(
  page  = 1,
  limit = 100,
): Promise<PaginatedPermissionsResult> {
  const res = await apiClient.get<ApiResponse<any>>(BASE, {
    params: { page, limit },
  });
  
  return {
    data:       res.data,
    total:      res.pagination?.total ?? 0,
    page:       res.pagination?.page ?? page,
    limit:      res.pagination?.limit ?? limit,
    totalPages: res.pagination?.totalPages ?? 1,
  };
}

/** Récupère une permission par son UUID. */
export async function fetchPermissionById(id: string): Promise<Permission> {
  const res = await apiClient.get<ApiResponse<Permission>>(`${BASE}/${id}`);
  return res.data;
}

/** Crée une permission. */
export async function createPermission(dto: CreatePermissionDto): Promise<Permission> {
  const res = await apiClient.post<ApiResponse<Permission>>(BASE, dto);
  return res.data;
}

/** Met à jour la description d'une permission. */
export async function updatePermission(
  id:  string,
  dto: UpdatePermissionDto,
): Promise<Permission> {
  const res = await apiClient.put<ApiResponse<Permission>>(`${BASE}/${id}`, dto);
  return res.data;
}

/** Supprime une permission. */
export async function deletePermission(id: string): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(`${BASE}/${id}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Rôles ↔ Permissions
// ─────────────────────────────────────────────────────────────────────────────

/** Retourne tous les rôles avec leurs permissions agrégées. */
export async function fetchRolesWithPermissions(): Promise<RoleWithPermissions[]> {
  const res = await apiClient.get<ApiResponse<RoleWithPermissions[]>>(`${BASE}/roles`);
  return res.data;
}

/** Retourne les permissions d'un rôle spécifique. */
export async function fetchPermissionsByRole(roleId: string): Promise<Permission[]> {
  const res = await apiClient.get<ApiResponse<Permission[]>>(`${BASE}/roles/${roleId}`);
  return res.data;
}

/** Assigne une liste de permissions à un rôle. */
export async function assignPermissionsToRole(
  roleId: string,
  dto:    AssignPermissionsDto,
): Promise<void> {
  await apiClient.post<ApiResponse<null>>(`${BASE}/roles/${roleId}`, dto);
}

/** Retire une permission d'un rôle. */
export async function removePermissionFromRole(
  roleId:       string,
  permissionId: string,
): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(`${BASE}/roles/${roleId}/${permissionId}`);
}
