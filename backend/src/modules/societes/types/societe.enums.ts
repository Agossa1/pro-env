/*
 * |--------------------------------------------------------------------------
 * | SOCIETE ENUMS
 * |--------------------------------------------------------------------------
 * | Types de sociétés (prestataires) pour le module Societes.
 * | Reflète l'enum PostgreSQL `organization_type_enum`.
 * |--------------------------------------------------------------------------
 */

export enum SocieteType {
  PUBLIC_COMPANY = 'PUBLIC_COMPANY',
  PRIVATE_COMPANY = 'PRIVATE_COMPANY',
  UTILITY = 'UTILITY',
  NGO = 'NGO',
}