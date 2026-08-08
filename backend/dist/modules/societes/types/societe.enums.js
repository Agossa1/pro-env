"use strict";
/*
 * |--------------------------------------------------------------------------
 * | SOCIETE ENUMS
 * |--------------------------------------------------------------------------
 * | Types de sociétés (prestataires) pour le module Societes.
 * | Reflète l'enum PostgreSQL `organization_type_enum`.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocieteType = void 0;
var SocieteType;
(function (SocieteType) {
    SocieteType["PUBLIC_COMPANY"] = "PUBLIC_COMPANY";
    SocieteType["PRIVATE_COMPANY"] = "PRIVATE_COMPANY";
    SocieteType["UTILITY"] = "UTILITY";
    SocieteType["NGO"] = "NGO";
})(SocieteType || (exports.SocieteType = SocieteType = {}));
//# sourceMappingURL=societe.enums.js.map