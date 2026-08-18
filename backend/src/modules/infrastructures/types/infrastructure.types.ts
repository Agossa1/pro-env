/*
 * |--------------------------------------------------------------------------
 * | INFRASTRUCTURE TYPES
 * |--------------------------------------------------------------------------
 * | Row types   → structure brute PostgreSQL (snake_case)
 * | Domain types → objets métier camelCase (services & controllers)
 * | Payload types → données d'entrée vers le repository
 * |--------------------------------------------------------------------------
 */

import { InfrastructureType, InfrastructureCondition, InfrastructureStatus } from './infrastructure.enums';

// ─────────────────────────────────────────────────────────────────────────────
// ROW TYPES — structure brute PostgreSQL (snake_case)
// ─────────────────────────────────────────────────────────────────────────────

export interface InfrastructureRow {
  id: string;
  territory_id: string;
  mapped_area_id: string | null;
  name: string;
  reference_code: string | null;
  type: InfrastructureType;
  condition: InfrastructureCondition;
  status: InfrastructureStatus;
  description: string | null;
  material: string | null;
  dimensions: any;
  installation_date: Date | null;
  last_maintained_at: Date | null;
  location: any;
  geometry: any;
  latitude: number | null;
  longitude: number | null;
  metadata: any;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN TYPES — objets métier camelCase
// ─────────────────────────────────────────────────────────────────────────────

export interface Infrastructure {
  id: string;
  territoryId: string;
  territoryName?: string;
  mappedAreaId: string | null;
  name: string;
  referenceCode: string | null;
  type: InfrastructureType;
  condition: InfrastructureCondition;
  status: InfrastructureStatus;
  description: string | null;
  material: string | null;
  dimensions: Record<string, unknown> | null;
  installationDate: Date | null;
  lastMaintainedAt: Date | null;
  location: any;
  geometry: any;
  latitude: number | null;
  longitude: number | null;
  metadata: Record<string, unknown> | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────────────────────

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYLOAD TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateInfrastructurePayload {
  territoryId: string;
  mappedAreaId?: string | null;
  name: string;
  referenceCode?: string | null;
  type: InfrastructureType;
  condition?: InfrastructureCondition;
  status?: InfrastructureStatus;
  description?: string | null;
  material?: string | null;
  dimensions?: Record<string, unknown> | null;
  installationDate?: Date | null;
  lastMaintainedAt?: Date | null;
  location?: any;
  geometry?: any;
  latitude?: number | null;
  longitude?: number | null;
  metadata?: Record<string, unknown> | null;
  createdBy?: string | null;
}

export interface UpdateInfrastructurePayload {
  name?: string;
  referenceCode?: string | null;
  type?: InfrastructureType;
  condition?: InfrastructureCondition;
  status?: InfrastructureStatus;
  description?: string | null;
  material?: string | null;
  dimensions?: Record<string, unknown> | null;
  installationDate?: Date | null;
  lastMaintainedAt?: Date | null;
  location?: any;
  geometry?: any;
  latitude?: number | null;
  longitude?: number | null;
  metadata?: Record<string, unknown> | null;
}