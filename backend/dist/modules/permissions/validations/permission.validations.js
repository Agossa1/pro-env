"use strict";
/*
 * |--------------------------------------------------------------------------
 * | PERMISSION VALIDATIONS
 * |--------------------------------------------------------------------------
 * | Schémas Zod pour les entrées du module Permissions.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionIdParamSchema = exports.RoleIdParamSchema = exports.IdParamSchema = exports.AssignPermissionsSchema = exports.UpdatePermissionSchema = exports.CreatePermissionSchema = void 0;
const zod_1 = require("zod");
const permission_enums_1 = require("../types/permission.enums");
/** Liste des modules valides pour une permission */
const ModuleEnum = zod_1.z.enum(Object.values(permission_enums_1.PermissionModule));
/** Liste des actions valides pour une permission */
const ActionEnum = zod_1.z.enum(Object.values(permission_enums_1.PermissionAction));
exports.CreatePermissionSchema = zod_1.z.object({
    module: ModuleEnum,
    action: ActionEnum,
    description: zod_1.z.string().max(500, 'La description ne doit pas dépasser 500 caractères').optional(),
});
exports.UpdatePermissionSchema = zod_1.z.object({
    description: zod_1.z
        .string()
        .max(500, 'La description ne doit pas dépasser 500 caractères')
        .nullable()
        .optional(),
});
exports.AssignPermissionsSchema = zod_1.z.object({
    permissionIds: zod_1.z.array(zod_1.z.string().uuid("Chaque permission doit être un UUID valide")).min(1, 'Au moins une permission est requise'),
});
exports.IdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("L'identifiant doit être un UUID valide"),
});
exports.RoleIdParamSchema = zod_1.z.object({
    roleId: zod_1.z.string().uuid("L'identifiant du rôle doit être un UUID valide"),
});
exports.PermissionIdParamSchema = zod_1.z.object({
    permissionId: zod_1.z.string().uuid("L'identifiant de la permission doit être un UUID valide"),
});
//# sourceMappingURL=permission.validations.js.map