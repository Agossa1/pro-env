/*
 * |--------------------------------------------------------------------------
 * | INTERVENTION ENUMS
 * |--------------------------------------------------------------------------
 * | Statuts d'intervention et rôles en équipe. Reflète les enums PostgreSQL
 * | du module 10 (interventions) : field_assignment_status_enum,
 * | team_member_role_enum.
 * |--------------------------------------------------------------------------
 */

export enum InterventionStatus {
  NOT_STARTED = 'not_started',
  STARTED = 'started',
  PAUSED = 'paused',
  RESUMED = 'resumed',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum TeamMemberRole {
  LEADER = 'leader',
  MEMBER = 'member',
}