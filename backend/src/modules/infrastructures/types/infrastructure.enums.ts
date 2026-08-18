/*
 * |--------------------------------------------------------------------------
 * | INFRASTRUCTURE ENUMS
 * |--------------------------------------------------------------------------
 * | Types et statuts des équipements physiques urbains. Reflète les enums
 * | PostgreSQL du module 12 (infrastructures) : infrastructure_type_enum,
 * | infrastructure_condition_enum et enum_status.
 * |--------------------------------------------------------------------------
 */

export enum InfrastructureType {
  DRAIN = 'drain',
  ROAD = 'road',
  BRIDGE = 'bridge',
  WATER_PIPE = 'water_pipe',
  SEWER_PIPE = 'sewer_pipe',
  STREETLIGHT = 'streetlight',
  WASTE_BIN = 'waste_bin',
  WELL = 'well',
  MARKET = 'market',
  SCHOOL = 'school',
  HEALTH_CENTER = 'health_center',
  PUBLIC_TOILET = 'public_toilet',
  PARK = 'park',
  OTHER = 'other',
}

export enum InfrastructureCondition {
  NEW = 'new',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  CRITICAL = 'critical',
  DESTROYED = 'destroyed',
}

export enum InfrastructureStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}