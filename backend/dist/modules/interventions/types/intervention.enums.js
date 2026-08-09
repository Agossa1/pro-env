"use strict";
/*
 * |--------------------------------------------------------------------------
 * | INTERVENTION ENUMS
 * |--------------------------------------------------------------------------
 * | Statuts d'intervention et rôles en équipe. Reflète les enums PostgreSQL
 * | du module 10 (interventions) : field_assignment_status_enum,
 * | team_member_role_enum.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamMemberRole = exports.InterventionStatus = void 0;
var InterventionStatus;
(function (InterventionStatus) {
    InterventionStatus["NOT_STARTED"] = "not_started";
    InterventionStatus["STARTED"] = "started";
    InterventionStatus["PAUSED"] = "paused";
    InterventionStatus["RESUMED"] = "resumed";
    InterventionStatus["COMPLETED"] = "completed";
    InterventionStatus["FAILED"] = "failed";
    InterventionStatus["CANCELLED"] = "cancelled";
})(InterventionStatus || (exports.InterventionStatus = InterventionStatus = {}));
var TeamMemberRole;
(function (TeamMemberRole) {
    TeamMemberRole["LEADER"] = "leader";
    TeamMemberRole["MEMBER"] = "member";
})(TeamMemberRole || (exports.TeamMemberRole = TeamMemberRole = {}));
//# sourceMappingURL=intervention.enums.js.map