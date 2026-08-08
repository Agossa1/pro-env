/*
 * |--------------------------------------------------------------------------
 * | TERRITORY ENUMS
 * |--------------------------------------------------------------------------
 * | Miroir strict des types PostgreSQL définis dans 01.schema.sql.
 * |--------------------------------------------------------------------------
 */

export enum TerritoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum TerritoryTypeCode {
  PAYS = 'PAYS',
  DEPARTMENT = 'DEPARTMENT',
  COMMUNE = 'COMMUNE',
  ARRONDISSEMENT = 'ARRONDISSEMENT',
  QUARTIER = 'QUARTIER',
}