"use strict";
/*
 * |--------------------------------------------------------------------------
 * | INFRASTRUCTURE ENUMS
 * |--------------------------------------------------------------------------
 * | Types et statuts des équipements physiques urbains. Reflète les enums
 * | PostgreSQL du module 12 (infrastructures) : infrastructure_type_enum,
 * | infrastructure_condition_enum et enum_status.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfrastructureStatus = exports.InfrastructureCondition = exports.InfrastructureType = void 0;
var InfrastructureType;
(function (InfrastructureType) {
    InfrastructureType["DRAIN"] = "drain";
    InfrastructureType["ROAD"] = "road";
    InfrastructureType["BRIDGE"] = "bridge";
    InfrastructureType["WATER_PIPE"] = "water_pipe";
    InfrastructureType["SEWER_PIPE"] = "sewer_pipe";
    InfrastructureType["STREETLIGHT"] = "streetlight";
    InfrastructureType["WASTE_BIN"] = "waste_bin";
    InfrastructureType["WELL"] = "well";
    InfrastructureType["MARKET"] = "market";
    InfrastructureType["SCHOOL"] = "school";
    InfrastructureType["HEALTH_CENTER"] = "health_center";
    InfrastructureType["PUBLIC_TOILET"] = "public_toilet";
    InfrastructureType["PARK"] = "park";
    InfrastructureType["OTHER"] = "other";
})(InfrastructureType || (exports.InfrastructureType = InfrastructureType = {}));
var InfrastructureCondition;
(function (InfrastructureCondition) {
    InfrastructureCondition["NEW"] = "new";
    InfrastructureCondition["GOOD"] = "good";
    InfrastructureCondition["FAIR"] = "fair";
    InfrastructureCondition["POOR"] = "poor";
    InfrastructureCondition["CRITICAL"] = "critical";
    InfrastructureCondition["DESTROYED"] = "destroyed";
})(InfrastructureCondition || (exports.InfrastructureCondition = InfrastructureCondition = {}));
var InfrastructureStatus;
(function (InfrastructureStatus) {
    InfrastructureStatus["ACTIVE"] = "ACTIVE";
    InfrastructureStatus["INACTIVE"] = "INACTIVE";
    InfrastructureStatus["ARCHIVED"] = "ARCHIVED";
})(InfrastructureStatus || (exports.InfrastructureStatus = InfrastructureStatus = {}));
//# sourceMappingURL=infrastructure.enums.js.map