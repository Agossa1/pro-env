/*
 * |--------------------------------------------------------------------------
 * | REPORT ENUMS
 * |--------------------------------------------------------------------------
 * | Catégories, statuts, priorités et niveaux de risque des signalements.
 * | Reflète les enums PostgreSQL du module 08 (field_reports).
 * |--------------------------------------------------------------------------
 */

export enum IssueCategory {
  DRAINAGE = 'drainage',
  ROAD = 'road',
  WASTE = 'waste',
  BIODIVERSITY = 'biodiversity',
  ENVIRONMENT = 'environment',
  OTHER = 'other',
}

export enum ReportStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

export enum PriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum WaterFlowStatus {
  FREE = 'free',
  RESTRICTED = 'restricted',
  BLOCKED = 'blocked',
}