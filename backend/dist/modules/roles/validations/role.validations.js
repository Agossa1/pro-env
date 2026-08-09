"use strict";
/*
 * |--------------------------------------------------------------------------
 * | ROLE VALIDATIONS
 * |--------------------------------------------------------------------------
 * | Schémas Zod pour les entrées du module Roles.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeParamSchema = exports.IdParamSchema = exports.UpdateRoleSchema = exports.CreateRoleSchema = void 0;
const zod_1 = require("zod");
const role_enums_1 = require("../types/role.enums");
/** Liste des tiers valides pour un rôle */
const TierEnum = zod_1.z.enum(Object.values(role_enums_1.RoleTier));
exports.CreateRoleSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, 'Le code est requis').max(50, 'Le code ne doit pas dépasser 50 caractères'),
    name: zod_1.z.string().min(1, 'Le nom est requis').max(100, 'Le nom ne doit pas dépasser 100 caractères'),
    description: zod_1.z.string().max(500, 'La description ne doit pas dépasser 500 caractères').nullable().optional(),
    tier: TierEnum.nullable().optional(),
    routePrefix: zod_1.z.string().max(100, 'Le préfixe de route ne doit pas dépasser 100 caractères').nullable().optional(),
    dashboardPath: zod_1.z.string().max(255, 'Le chemin du tableau de bord ne doit pas dépasser 255 caractères').nullable().optional(),
    pageIds: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    canManageUsers: zod_1.z.boolean().optional(),
    canManageRoles: zod_1.z.boolean().optional(),
});
exports.UpdateRoleSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Le nom est requis').max(100).optional(),
    description: zod_1.z.string().max(500).nullable().optional(),
    tier: TierEnum.nullable().optional(),
    routePrefix: zod_1.z.string().max(100).nullable().optional(),
    dashboardPath: zod_1.z.string().max(255).nullable().optional(),
    pageIds: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    canManageUsers: zod_1.z.boolean().optional(),
    canManageRoles: zod_1.z.boolean().optional(),
});
exports.IdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("L'identifiant doit être un UUID valide"),
});
exports.CodeParamSchema = zod_1.z.object({
    code: zod_1.z.string().min(1, 'Le code est requis'),
});
//# sourceMappingURL=role.validations.js.map