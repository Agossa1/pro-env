/*
 * |--------------------------------------------------------------------------
 * | TEAM ENUMS
 * |--------------------------------------------------------------------------
 * | Types d'équipes et rôles des membres. Reflète les enums PostgreSQL
 * | du module 10 (interventions) : role_tier_enum, team_member_role_enum.
 * |--------------------------------------------------------------------------
 */

/** Deuxtypes d'équipes terrain */
export enum TeamType {
  /**
   * Équipe d'institution publique (mairie, ministère, préfecture).
   * Techniciens publics qui créent les signalements terrain.
   * organization_id = NULL.
   */
  INSTITUTION = 'institution',
  /**
   * Équipe d'une société prestataire (SONEB, SBEE, SGDS, BTP...).
   * Exécute les missions et interventions sur le terrain.
   * organization_id requis (FK organizations).
   */
  PROVIDER = 'provider',
}

/** Rôle d'un membre dans une équipe */
export enum TeamMemberRole {
  LEADER = 'leader',
  MEMBER = 'member',
}