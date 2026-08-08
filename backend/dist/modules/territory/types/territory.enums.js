"use strict";
/*
 * |--------------------------------------------------------------------------
 * | TERRITORY ENUMS
 * |--------------------------------------------------------------------------
 * | Miroir strict des types PostgreSQL définis dans 01.schema.sql.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerritoryTypeCode = exports.TerritoryStatus = void 0;
var TerritoryStatus;
(function (TerritoryStatus) {
    TerritoryStatus["ACTIVE"] = "ACTIVE";
    TerritoryStatus["INACTIVE"] = "INACTIVE";
    TerritoryStatus["ARCHIVED"] = "ARCHIVED";
})(TerritoryStatus || (exports.TerritoryStatus = TerritoryStatus = {}));
var TerritoryTypeCode;
(function (TerritoryTypeCode) {
    TerritoryTypeCode["PAYS"] = "PAYS";
    TerritoryTypeCode["DEPARTMENT"] = "DEPARTMENT";
    TerritoryTypeCode["COMMUNE"] = "COMMUNE";
    TerritoryTypeCode["ARRONDISSEMENT"] = "ARRONDISSEMENT";
    TerritoryTypeCode["QUARTIER"] = "QUARTIER";
})(TerritoryTypeCode || (exports.TerritoryTypeCode = TerritoryTypeCode = {}));
//# sourceMappingURL=territory.enums.js.map