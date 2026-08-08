/*
 * |--------------------------------------------------------------------------
 * | PERMISSION VALIDATIONS
 * |--------------------------------------------------------------------------
 * | Schémas Zod pour les entrées du module Permissions.
 * |--------------------------------------------------------------------------
 */

import { z } from 'zod';
import { PermissionModule, PermissionAction } from '../types/permission.enums';

/** Liste des modules valides pour une permission */
const ModuleEnum = z.enum(Object.values(PermissionModule) as [string, ...string[]]);

/** Liste des actions valides pour une permission */
const ActionEnum = z.enum(Object.values(PermissionAction) as [string, ...string[]]);

export const CreatePermissionSchema = z.object({
  module: ModuleEnum,
  action: ActionEnum,
  description: z.string().max(500, 'La description ne doit pas dépasser 500 caractères').optional(),
});

export const UpdatePermissionSchema = z.object({
  description: z
    .string()
    .max(500, 'La description ne doit pas dépasser 500 caractères')
    .nullable()
    .optional(),
});

export const AssignPermissionsSchema = z.object({
  permissionIds: z.array(
    z.string().uuid("Chaque permission doit être un UUID valide")
  ).min(1, 'Au moins une permission est requise'),
});

export const IdParamSchema = z.object({
  id: z.string().uuid("L'identifiant doit être un UUID valide"),
});

export const RoleIdParamSchema = z.object({
  roleId: z.string().uuid("L'identifiant du rôle doit être un UUID valide"),
});

export const PermissionIdParamSchema = z.object({
  permissionId: z.string().uuid("L'identifiant de la permission doit être un UUID valide"),
});