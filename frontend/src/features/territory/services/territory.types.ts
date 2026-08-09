/*
 * |--------------------------------------------------------------------------
 * | TERRITORY TYPES (frontend)
 * |--------------------------------------------------------------------------
 * | Miroir des types backend territory.types.ts
 * |--------------------------------------------------------------------------
 */

export interface Territory {
  id: string;
  code: string | null;
  name: string;
  territoryTypeId: string;
  territoryTypeCode?: string;
  territoryTypeName?: string;
  parentTerritoryId: string | null;
  status: string;
}

export interface PaginatedTerritoriesResult {
  data: Territory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
