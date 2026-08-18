/*
 * |--------------------------------------------------------------------------
 * | INTERVENTION TYPES
 * |--------------------------------------------------------------------------
 * | Row types   → structure brute PostgreSQL (snake_case)
 * | Domain types → objets métier camelCase (services & controllers)
 * | Payload types → données d'entrée vers le repository
 * |--------------------------------------------------------------------------
 */

import { InterventionStatus } from './intervention.enums';

// ─────────────────────────────────────────────────────────────────────────────
// ROW TYPES — structure brute PostgreSQL (snake_case)
// ─────────────────────────────────────────────────────────────────────────────

export interface InterventionRow {
  id: string;
  mission_id: string;
  assigned_societe_id: string;
  assigned_to_user_id: string | null;
  intervention_type: string;
  status: InterventionStatus;
  vehicle_notes: string | null;
  equipment_notes: string | null;
  started_at: Date | null;
  ended_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface FieldInterventionReportRow {
  id: string;
  intervention_id: string;
  report_id: string | null;
  created_by: string;
  work_done: string | null;
  blockage_removed_pct: number | null;
  final_condition_score: number | null;
  recommendations: string | null;
  completed: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN TYPES — objets métier camelCase
// ─────────────────────────────────────────────────────────────────────────────

export interface Intervention {
  id: string;
  missionId: string;
  assignedSocieteId: string;
  assignedToUserId: string | null;
  interventionType: string;
  status: InterventionStatus;
  vehicleNotes: string | null;
  equipmentNotes: string | null;
  startedAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface FieldInterventionReport {
  id: string;
  interventionId: string;
  reportId: string | null;
  createdBy: string;
  workDone: string | null;
  blockageRemovedPct: number | null;
  finalConditionScore: number | null;
  recommendations: string | null;
  completed: boolean;
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

export interface CreateInterventionPayload {
  missionId: string;
  assignedSocieteId: string;
  assignedToUserId?: string | null;
  interventionType: string;
  vehicleNotes?: string | null;
  equipmentNotes?: string | null;
}

export interface UpdateInterventionPayload {
  status?: InterventionStatus;
  assignedToUserId?: string | null;
  vehicleNotes?: string | null;
  equipmentNotes?: string | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
}

export interface CreateFieldReportPayload {
  interventionId: string;
  reportId?: string | null;
  workDone?: string | null;
  blockageRemovedPct?: number | null;
  finalConditionScore?: number | null;
  recommendations?: string | null;
  completed?: boolean;
  createdBy?: string | null;
}