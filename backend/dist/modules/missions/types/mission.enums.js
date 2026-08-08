"use strict";
/*
 * |--------------------------------------------------------------------------
 * | MISSION ENUMS
 * |--------------------------------------------------------------------------
 * | Types et statuts des missions, priorité. Reflète les enums PostgreSQL
 * | du module 09 (missions) : mission_type_enum, mission_status_enum,
 * | priority_level_enum.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriorityLevel = exports.MissionStatus = exports.MissionType = void 0;
var MissionType;
(function (MissionType) {
    MissionType["REPAIR"] = "repair";
    MissionType["MAINTENANCE"] = "maintenance";
    MissionType["INSPECTION"] = "inspection";
    MissionType["CLEANING"] = "cleaning";
    MissionType["CONSTRUCTION"] = "construction";
    MissionType["OTHER"] = "other";
})(MissionType || (exports.MissionType = MissionType = {}));
var MissionStatus;
(function (MissionStatus) {
    MissionStatus["DRAFT"] = "draft";
    MissionStatus["PLANNED"] = "planned";
    MissionStatus["ASSIGNED"] = "assigned";
    MissionStatus["ACCEPTED"] = "accepted";
    MissionStatus["REJECTED"] = "rejected";
    MissionStatus["IN_PROGRESS"] = "in_progress";
    MissionStatus["SUSPENDED"] = "suspended";
    MissionStatus["COMPLETED"] = "completed";
    MissionStatus["CANCELLED"] = "cancelled";
    MissionStatus["CLOSED"] = "closed";
})(MissionStatus || (exports.MissionStatus = MissionStatus = {}));
var PriorityLevel;
(function (PriorityLevel) {
    PriorityLevel["LOW"] = "low";
    PriorityLevel["MEDIUM"] = "medium";
    PriorityLevel["HIGH"] = "high";
    PriorityLevel["URGENT"] = "urgent";
    PriorityLevel["CRITICAL"] = "critical";
})(PriorityLevel || (exports.PriorityLevel = PriorityLevel = {}));
//# sourceMappingURL=mission.enums.js.map