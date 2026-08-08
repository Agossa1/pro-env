"use strict";
/*
 * |--------------------------------------------------------------------------
 * | ROLE ENUMS
 * |--------------------------------------------------------------------------
 * | Tiers de rôle utilisés pour le contrôle d'accès RBAC.
 * | Reflète l'enum PostgreSQL `role_tier_enum`.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleTier = void 0;
var RoleTier;
(function (RoleTier) {
    RoleTier["PLATFORM"] = "platform";
    RoleTier["TERRITORIAL"] = "territorial";
    RoleTier["FIELD"] = "field";
})(RoleTier || (exports.RoleTier = RoleTier = {}));
//# sourceMappingURL=role.enums.js.map