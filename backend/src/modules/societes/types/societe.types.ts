/*
 * |--------------------------------------------------------------------------
 * | SOCIETE TYPES
 * |--------------------------------------------------------------------------
 * | Row types   → structure brute PostgreSQL (snake_case)
 * | Domain types → objets métier camelCase (services & controllers)
 * | Payload types → données d'entrée vers le repository
 * |
 * | NOTE : le module applicatif s'appelle "societes" mais la table SQL reste
 * | `organizations` (échange avec les autres modules déjà en place).
 * |--------------------------------------------------------------------------
 */

import { SocieteType } from './societe.enums';

// ─────────────────────────────────────────────────────────────────────────────
// ROW TYPES — structure brute PostgreSQL (snake_case)
// ─────────────────────────────────────────────────────────────────────────────

export interface SocieteRow {
  id: string;
  name: string;
  type: SocieteType;
  registration_number: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SocieteTerritoryRow {
  id: string;
  organization_id: string;
  municipality_id: string | null;
  is_active: boolean;
  created_at: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN TYPES — objets métier camelCase
// ─────────────────────────────────────────────────────────────────────────────

export interface AppSociete {
  id: string;
  name: string;
  type: SocieteType;
  registrationNumber: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocieteTerritory {
  id: string;
  societeId: string;
  municipalityId: string | null;
  isActive: boolean;
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

export interface CreateSocietePayload {
  name: string;
  type: SocieteType;
  registrationNumber?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  isActive?: boolean;
  /**
   * Commune (zone de compétence) à laquelle associer la société.
   * - Admin : fourni dans le body (association libre)
   * - Mairie/Ministere : omis, on utilise la commune de l'utilisateur connecté
   */
  municipalityId?: string | null;
}

export interface UpdateSocietePayload {
  name?: string;
  type?: SocieteType;
  registrationNumber?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  isActive?: boolean;
}