/*
 * |--------------------------------------------------------------------------
 * | TERRITORY API (frontend)
 * |--------------------------------------------------------------------------
 * | Appels vers /api/territories
 * |--------------------------------------------------------------------------
 */

import { apiClient, type ApiResponse } from '../../../libs/api-client';
import type { Territory, PaginatedTerritoriesResult } from './territory.types';

/** GET /territories — Liste paginée des territoires */
export async function fetchTerritories(
  page = 1,
  limit = 200,
  territoryTypeId?: string,
  territoryTypeCode?: string,
  search?: string
): Promise<PaginatedTerritoriesResult> {
  const res = await apiClient.get<ApiResponse<any>>('/territories', {
    params: {
      page,
      limit,
      ...(territoryTypeId   ? { territoryTypeId }   : {}),
      ...(territoryTypeCode ? { territoryTypeCode } : {}),
      ...(search            ? { search }            : {}),
    },
  });

  const raw = res.data;
  const items: Territory[] = Array.isArray(raw) ? raw : [];

  return {
    data:       items,
    total:      res.pagination?.total ?? items.length,
    page:       res.pagination?.page ?? page,
    limit:      res.pagination?.limit ?? limit,
    totalPages: res.pagination?.totalPages ?? 1,
  };
}
