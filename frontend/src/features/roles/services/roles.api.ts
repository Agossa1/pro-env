/*
 * |--------------------------------------------------------------------------
 * | ROLES API
 * |--------------------------------------------------------------------------
 * | Couche d'appels HTTP vers le module /api/roles du backend.
 * | Utilise apiClient (fetch + gestion 401/refresh automatique).
 * |--------------------------------------------------------------------------
 */

import { apiClient, type ApiResponse } from '../../../libs/api-client';
import type {
  AppRole,
  PaginatedRolesResult,
  CreateRoleDto,
  UpdateRoleDto,
} from './roles.types';

const BASE = '/roles';

// ─────────────────────────────────────────────────────────────────────────────
// Lecture
// ─────────────────────────────────────────────────────────────────────────────

/** Récupère la liste paginée des rôles. */
export async function fetchRoles(
  page  = 1,
  limit = 50,
): Promise<PaginatedRolesResult> {
  const res = await apiClient.get<ApiResponse<any>>(BASE, {
    params: { page, limit },
  });
  
  // Le backend renvoie { data: [], pagination: {} } au niveau de l'objet racine
  return {
    data:       res.data,
    total:      res.pagination?.total ?? 0,
    page:       res.pagination?.page ?? page,
    limit:      res.pagination?.limit ?? limit,
    totalPages: res.pagination?.totalPages ?? 1,
  };
}

/** Récupère un rôle par son UUID. */
export async function fetchRoleById(id: string): Promise<AppRole> {
  const res = await apiClient.get<ApiResponse<AppRole>>(`${BASE}/${id}`);
  return res.data;
}

/** Récupère un rôle par son code (ex: 'super_admin'). */
export async function fetchRoleByCode(code: string): Promise<AppRole> {
  const res = await apiClient.get<ApiResponse<AppRole>>(`${BASE}/code/${code}`);
  return res.data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Écriture
// ─────────────────────────────────────────────────────────────────────────────

/** Crée un nouveau rôle. */
export async function createRole(dto: CreateRoleDto): Promise<AppRole> {
  const res = await apiClient.post<ApiResponse<AppRole>>(BASE, dto);
  return res.data;
}

/** Met à jour un rôle existant. */
export async function updateRole(id: string, dto: UpdateRoleDto): Promise<AppRole> {
  const res = await apiClient.put<ApiResponse<AppRole>>(`${BASE}/${id}`, dto);
  return res.data;
}

/** Supprime un rôle (échoue si des utilisateurs y sont rattachés). */
export async function deleteRole(id: string): Promise<void> {
  await apiClient.delete<ApiResponse<null>>(`${BASE}/${id}`);
}
