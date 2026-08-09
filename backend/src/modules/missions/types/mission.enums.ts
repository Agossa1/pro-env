/*
 * |--------------------------------------------------------------------------
 * | MISSION ENUMS
 * |--------------------------------------------------------------------------
 * | Types et statuts des missions, priorité. Reflète les enums PostgreSQL
 * | du module 09 (missions) : mission_type_enum, mission_status_enum,
 * | priority_level_enum.
 * |--------------------------------------------------------------------------
 */

export enum MissionType {
  REPAIR = 'repair',
  MAINTENANCE = 'maintenance',
  INSPECTION = 'inspection',
  CLEANING = 'cleaning',
  CONSTRUCTION = 'construction',
  OTHER = 'other',
}

export enum MissionStatus {
  DRAFT = 'draft',
  PLANNED = 'planned',
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  IN_PROGRESS = 'in_progress',
  SUSPENDED = 'suspended',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  CLOSED = 'closed',
}

export enum PriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}