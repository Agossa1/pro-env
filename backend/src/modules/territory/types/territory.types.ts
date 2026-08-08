/*
 * |--------------------------------------------------------------------------
 * | TERRITORY TYPES
 * |--------------------------------------------------------------------------
 * | Row types   → structure brute PostgreSQL (snake_case)
 * | Domain types → objets métier camelCase (services & controllers)
 * | Payload types → données d'entrée vers le repository
 * |--------------------------------------------------------------------------
 */

import { TerritoryStatus } from './territory.enums';

// ─────────────────────────────────────────────────────────────────────────────
// ROW TYPES — structure brute PostgreSQL (snake_case)
// ─────────────────────────────────────────────────────────────────────────────

export interface TerritoryTypeRow {
  id: string;
  code: string;
  name: string;
  hierarchy_level: number;
  created_at: Date;
  updated_at: Date;
}

export interface TerritoryRow {
  id: string;
  territory_type_id: string;
  parent_territory_id: string | null;
  organization_id: string | null;
  code: string | null;
  name: string;
  geometry: any; // GEOMETRY(MultiPolygon, 4326)
  centroid: any; // GEOMETRY(Point, 4326)
  bbox: any; // GEOMETRY(Polygon, 4326)
  status: TerritoryStatus;
  metadata: Record<string, any>;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface TerritorySectorRow {
  id: string;
  territory_id: string;
  name: string;
  geometry: any;
  centroid: any;
  status: TerritoryStatus;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN TYPES — objets métier camelCase
// ─────────────────────────────────────────────────────────────────────────────

export interface TerritoryType {
  id: string;
  code: string;
  name: string;
  hierarchyLevel: number;
}

export interface Territory {
  id: string;
  territoryTypeId: string;
  territoryTypeCode?: string;
  territoryTypeName?: string;
  parentTerritoryId: string | null;
  organizationId: string | null;
  code: string | null;
  name: string;
  geometry?: any;
  centroid?: any;
  bbox?: any;
  status: TerritoryStatus;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface TerritorySector {
  id: string;
  territoryId: string;
  name: string;
  geometry?: any;
  centroid?: any;
  status: TerritoryStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION

/** Paramètres de pagination (page 1-based, limit par page) */
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

/** Résultat paginé générique */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// PAYLOAD TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateTerritoryTypePayload {
  code: string;
  name: string;
  hierarchyLevel: number;
}

export interface UpdateTerritoryTypePayload {
  name?: string;
  hierarchyLevel?: number;
}

export interface CreateTerritoryPayload {
  territoryTypeId: string;
  parentTerritoryId?: string | null;
  organizationId?: string | null;
  code?: string | null;
  name: string;
  geometry?: any;
  status?: TerritoryStatus;
  metadata?: Record<string, any>;
  createdBy?: string | null;
  /** Secteur initial éventuel (table territory_sectors) */
  initialSector?: { name: string; geometry?: any } | null;
  /** Organisation assignée éventuellement (table organization_territories) */
  assignOrganizationId?: string | null;
}

export interface UpdateTerritoryPayload {
  name?: string;
  parentTerritoryId?: string | null;
  organizationId?: string | null;
  code?: string | null;
  geometry?: any;
  status?: TerritoryStatus;
  metadata?: Record<string, any>;
}