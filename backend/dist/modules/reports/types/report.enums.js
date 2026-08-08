"use strict";
/*
 * |--------------------------------------------------------------------------
 * | REPORT ENUMS
 * |--------------------------------------------------------------------------
 * | Catégories, statuts, priorités et niveaux de risque des signalements.
 * | Reflète les enums PostgreSQL du module 08 (field_reports).
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WaterFlowStatus = exports.RiskLevel = exports.PriorityLevel = exports.ReportStatus = exports.IssueCategory = void 0;
var IssueCategory;
(function (IssueCategory) {
    IssueCategory["DRAINAGE"] = "drainage";
    IssueCategory["ROAD"] = "road";
    IssueCategory["WASTE"] = "waste";
    IssueCategory["BIODIVERSITY"] = "biodiversity";
    IssueCategory["ENVIRONMENT"] = "environment";
    IssueCategory["OTHER"] = "other";
})(IssueCategory || (exports.IssueCategory = IssueCategory = {}));
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["DRAFT"] = "draft";
    ReportStatus["SUBMITTED"] = "submitted";
    ReportStatus["UNDER_REVIEW"] = "under_review";
    ReportStatus["IN_PROGRESS"] = "in_progress";
    ReportStatus["RESOLVED"] = "resolved";
    ReportStatus["CLOSED"] = "closed";
    ReportStatus["ARCHIVED"] = "archived";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
var PriorityLevel;
(function (PriorityLevel) {
    PriorityLevel["LOW"] = "low";
    PriorityLevel["MEDIUM"] = "medium";
    PriorityLevel["HIGH"] = "high";
    PriorityLevel["URGENT"] = "urgent";
    PriorityLevel["CRITICAL"] = "critical";
})(PriorityLevel || (exports.PriorityLevel = PriorityLevel = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["LOW"] = "low";
    RiskLevel["MEDIUM"] = "medium";
    RiskLevel["HIGH"] = "high";
    RiskLevel["CRITICAL"] = "critical";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
var WaterFlowStatus;
(function (WaterFlowStatus) {
    WaterFlowStatus["FREE"] = "free";
    WaterFlowStatus["RESTRICTED"] = "restricted";
    WaterFlowStatus["BLOCKED"] = "blocked";
})(WaterFlowStatus || (exports.WaterFlowStatus = WaterFlowStatus = {}));
//# sourceMappingURL=report.enums.js.map