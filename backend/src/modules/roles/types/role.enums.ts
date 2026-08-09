/*
 * |--------------------------------------------------------------------------
 * | ROLE ENUMS
 * |--------------------------------------------------------------------------
 * | Tiers de rôle utilisés pour le contrôle d'accès RBAC.
 * | Reflète l'enum PostgreSQL `role_tier_enum`.
 * |--------------------------------------------------------------------------
 */

export enum RoleTier {
  PLATFORM = 'platform',
  TERRITORIAL = 'territorial',
  FIELD = 'field',
}