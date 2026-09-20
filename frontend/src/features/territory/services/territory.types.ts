/*
 * |--------------------------------------------------------------------------
 * | TERRITORY TYPES (frontend)
 * |--------------------------------------------------------------------------
 * | Modèle à 4 niveaux : Région → Commune → Arrondissement → Quartier
 * |--------------------------------------------------------------------------
 */

export interface Region {
  id: string;
  code: string | null;
  name: string;
  geometry?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface Municipality {
  id: string;
  regionId: string;
  regionName?: string;
  organizationId?: string | null;
  code: string | null;
  name: string;
  geometry?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface District {
  id: string;
  municipalityId: string;
  municipalityName?: string;
  code: string | null;
  name: string;
  geometry?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface Neighborhood {
  id: string;
  districtId: string;
  districtName?: string;
  code: string | null;
  name: string;
  geometry?: any;
  createdAt?: string;
  updatedAt?: string;
}

/** Type union pour les composants qui peuvent afficher n'importe quel niveau */
export type TerritoryItem =
  | (Region & { level: 'region' })
  | (Municipality & { level: 'municipality' })
  | (District & { level: 'district' })
  | (Neighborhood & { level: 'neighborhood' });

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type PaginatedRegionsResult = PaginatedResult<Region>;
export type PaginatedMunicipalitiesResult = PaginatedResult<Municipality>;
export type PaginatedDistrictsResult = PaginatedResult<District>;
export type PaginatedNeighborhoodsResult = PaginatedResult<Neighborhood>;

// ─── Anciens types conservés pour compatibilité transitoire ───────────────────

/** @deprecated Utiliser Region | Municipality | District | Neighborhood */
export interface Territory {
  id: string;
  code: string | null;
  name: string;
  territoryTypeId: string;
  territoryTypeCode?: string;
  territoryTypeName?: string;
  parentTerritoryId: string | null;
  status: string;
  geometry?: any;
  centroid?: any;
  bbox?: any;
}

export interface PaginatedTerritoriesResult {
  data: Territory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
