/*
 * |--------------------------------------------------------------------------
 * | ROLE VALIDATIONS
 * |--------------------------------------------------------------------------
 * | Schémas Zod pour les entrées du module Roles.
 * |--------------------------------------------------------------------------
 */

import { z } from 'zod';
import { RoleTier } from '../types/role.enums';

/** Liste des tiers valides pour un rôle */
const TierEnum = z.enum(Object.values(RoleTier) as [string, ...string[]]);

export const CreateRoleSchema = z.object({
  code: z.string().min(1, 'Le code est requis').max(50, 'Le code ne doit pas dépasser 50 caractères'),
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne doit pas dépasser 100 caractères'),
  description: z.string().max(500, 'La description ne doit pas dépasser 500 caractères').nullable().optional(),
  tier: TierEnum.nullable().optional(),
  routePrefix: z.string().max(100, 'Le préfixe de route ne doit pas dépasser 100 caractères').nullable().optional(),
  dashboardPath: z.string().max(255, 'Le chemin du tableau de bord ne doit pas dépasser 255 caractères').nullable().optional(),
  pageIds: z.array(z.string().min(1)).optional(),
  canManageUsers: z.boolean().optional(),
  canManageRoles: z.boolean().optional(),
});

export const UpdateRoleSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  tier: TierEnum.nullable().optional(),
  routePrefix: z.string().max(100).nullable().optional(),
  dashboardPath: z.string().max(255).nullable().optional(),
  pageIds: z.array(z.string().min(1)).optional(),
  canManageUsers: z.boolean().optional(),
  canManageRoles: z.boolean().optional(),
});

export const IdParamSchema = z.object({
  id: z.string().uuid("L'identifiant doit être un UUID valide"),
});

export const CodeParamSchema = z.object({
  code: z.string().min(1, 'Le code est requis'),
});