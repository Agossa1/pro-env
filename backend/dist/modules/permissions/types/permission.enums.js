"use strict";
/*
 * |--------------------------------------------------------------------------
 * | PERMISSION ENUMS
 * |--------------------------------------------------------------------------
 * | Modules et actions disponibles pour le contrôle d'accès RBAC.
 * | Reflète les valeurs utilisées dans la table `permissions` (module, action).
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionAction = exports.PermissionModule = void 0;
/** Modules applicatifs auxquels des permissions peuvent être attachées */
var PermissionModule;
(function (PermissionModule) {
    PermissionModule["AUTH"] = "auth";
    PermissionModule["PERMISSIONS"] = "permissions";
    PermissionModule["ROLES"] = "roles";
    PermissionModule["TERRITORY"] = "territory";
    PermissionModule["ORGANIZATIONS"] = "organizations";
    PermissionModule["REPORTS"] = "reports";
    PermissionModule["MISSIONS"] = "missions";
    PermissionModule["INTERVENTIONS"] = "interventions";
    PermissionModule["INFRASTRUCTURES"] = "infrastructures";
    PermissionModule["MEDIA"] = "media";
    PermissionModule["TEAMS"] = "teams";
})(PermissionModule || (exports.PermissionModule = PermissionModule = {}));
/** Actions granulaires exécutables sur un module */
var PermissionAction;
(function (PermissionAction) {
    PermissionAction["CREATE"] = "create";
    PermissionAction["READ"] = "read";
    PermissionAction["UPDATE"] = "update";
    PermissionAction["DELETE"] = "delete";
    PermissionAction["MANAGE"] = "manage";
    PermissionAction["ASSIGN"] = "assign";
})(PermissionAction || (exports.PermissionAction = PermissionAction = {}));
//# sourceMappingURL=permission.enums.js.map