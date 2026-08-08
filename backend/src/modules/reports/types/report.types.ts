/*
 * |--------------------------------------------------------------------------
 * | REPORT TYPES
 * |--------------------------------------------------------------------------
 * | Row types   → structure brute PostgreSQL (snake_case)
 * | Domain types → objets métier camelCase (services & controllers)
 * | Payload types → données d'entrée vers le repository
 * |--------------------------------------------------------------------------
 */

import {
  IssueCategory,
  ReportStatus,
  PriorityLevel,
  RiskLevel,
  WaterFlowStatus,
} from './report.enums';

// ─────────────────────────────────────────────────────────────────────────────
// ROW TYPES — structure brute PostgreSQL (snake_case)
// ─────────────────────────────────────────────────────────────────────────────

export interface ReportRow {
  id: string;
  territory_id: string;
  infrastructure_id: string | null;
  mapped_area_id: string | null;
  title: string;
  description: string | null;
  issue_category: IssueCategory;
  priority: PriorityLevel;
  risk_level: RiskLevel;
  status: ReportStatus;
  location: any;
  latitude: number | null;
  longitude: number | null;
  created_by: string;
  reported_at: Date;
  assigned_to: string | null;
  resolved_at: Date | null;
  sla_hours: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export interface ReportDetailRow {
  report_id: string;
  created_at: Date;
}

/** Détail drainage */
export interface ReportDrainageDetailRow extends ReportDetailRow {
  blockage_level_pct: number | null;
  water_level_cm: number | null;
  flow_status: WaterFlowStatus | null;
}

/** Détail route */
export interface ReportRoadDetailRow extends ReportDetailRow {
  damage_surface_m2: number | null;
  pothole_depth_cm: number | null;
}

/** Détail déchets */
export interface ReportWasteDetailRow extends ReportDetailRow {
  estimated_volume_m3: number | null;
  waste_type: string | null;
}

/** Détail biodiversité */
export interface ReportBiodiversityDetailRow extends ReportDetailRow {
  species_name: string | null;
  observation_type: string | null;
  count: number | null;
}

/** Détail environnement */
export interface ReportEnvironmentDetailRow extends ReportDetailRow {
  sensor_id: string | null;
  measured_value: number | null;
  unit: string | null;
}

export interface ReportStatusHistoryRow {
  id: string;
  report_id: string;
  old_status: ReportStatus | null;
  new_status: ReportStatus;
  changed_by: string | null;
  created_at: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOMAIN TYPES — objets métier camelCase
// ─────────────────────────────────────────────────────────────────────────────

export interface Report {
  id: string;
  territoryId: string;
  infrastructureId: string | null;
  mappedAreaId: string | null;
  title: string;
  description: string | null;
  issueCategory: IssueCategory;
  priority: PriorityLevel;
  riskLevel: RiskLevel;
  status: ReportStatus;
  latitude: number | null;
  longitude: number | null;
  createdBy: string;
  reportedAt: Date;
  assignedTo: string | null;
  resolvedAt: Date | null;
  slaHours: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

/** Détails spécifiques par catégorie (1:1) */
export type ReportDetail =
  | ({ category: IssueCategory.DRAINAGE } & Omit<ReportDrainageDetailRow, 'report_id' | 'created_at'>)
  | ({ category: IssueCategory.ROAD } & Omit<ReportRoadDetailRow, 'report_id' | 'created_at'>)
  | ({ category: IssueCategory.WASTE } & Omit<ReportWasteDetailRow, 'report_id' | 'created_at'>)
  | ({ category: IssueCategory.BIODIVERSITY } & Omit<ReportBiodiversityDetailRow, 'report_id' | 'created_at'>)
  | ({ category: IssueCategory.ENVIRONMENT } & Omit<ReportEnvironmentDetailRow, 'report_id' | 'created_at'>);

export interface ReportStatusHistory {
  id: string;
  reportId: string;
  oldStatus: ReportStatus | null;
  newStatus: ReportStatus;
  changedBy: string | null;
  createdAt: Date;
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

export interface CreateReportPayload {
  territoryId: string;
  infrastructureId?: string | null;
  mappedAreaId?: string | null;
  title: string;
  description?: string | null;
  issueCategory: IssueCategory;
  priority?: PriorityLevel;
  riskLevel?: RiskLevel;
  latitude?: number | null;
  longitude?: number | null;
  slaHours?: number;
  status?: ReportStatus;
  /** Créateur du rapport (injecté par le service depuis l'utilisateur connecté) */
  createdBy?: string | null;
  /** Détails spécifiques à la catégorie (optionnel) */
  details?: {
    blockageLevelPct?: number;
    waterLevelCm?: number;
    flowStatus?: WaterFlowStatus;
    damageSurfaceM2?: number;
    potholeDepthCm?: number;
    estimatedVolumeM3?: number;
    wasteType?: string;
    speciesName?: string;
    observationType?: string;
    count?: number;
    sensorId?: string;
    measuredValue?: number;
    unit?: string;
  } | null;
}

export interface UpdateReportPayload {
  title?: string;
  description?: string | null;
  issueCategory?: IssueCategory;
  priority?: PriorityLevel;
  riskLevel?: RiskLevel;
  status?: ReportStatus;
  assignedTo?: string | null;
  resolvedAt?: Date | null;
  latitude?: number | null;
  longitude?: number | null;
}