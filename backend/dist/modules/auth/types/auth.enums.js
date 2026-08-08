"use strict";
/*
|--------------------------------------------------------------------------
| AUTH ENUMS
|--------------------------------------------------------------------------
| Miroir strict des types PostgreSQL définis dans 01.schema.sql.
|--------------------------------------------------------------------------
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditAction = exports.OtpType = exports.UserRoleCode = exports.RoleTier = void 0;
var RoleTier;
(function (RoleTier) {
    RoleTier["PLATFORM"] = "platform";
    RoleTier["TERRITORIAL"] = "territorial";
    RoleTier["FIELD"] = "field";
})(RoleTier || (exports.RoleTier = RoleTier = {}));
var UserRoleCode;
(function (UserRoleCode) {
    UserRoleCode["SUPER_ADMIN"] = "super_admin";
    UserRoleCode["ADMIN_MINISTERE"] = "admin_ministere";
    UserRoleCode["ADMIN_MAIRIE"] = "admin_mairie";
    UserRoleCode["TECHNICIEN"] = "technicien";
    UserRoleCode["PREFECTURE"] = "prefecture";
    UserRoleCode["CITOYEN"] = "citoyen";
})(UserRoleCode || (exports.UserRoleCode = UserRoleCode = {}));
var OtpType;
(function (OtpType) {
    OtpType["EMAIL_VERIFICATION"] = "EMAIL_VERIFICATION";
    OtpType["PHONE_VERIFICATION"] = "PHONE_VERIFICATION";
    OtpType["PASSWORD_RESET"] = "PASSWORD_RESET";
    OtpType["TWO_FACTOR"] = "TWO_FACTOR";
})(OtpType || (exports.OtpType = OtpType = {}));
var AuditAction;
(function (AuditAction) {
    AuditAction["INSERT"] = "INSERT";
    AuditAction["UPDATE"] = "UPDATE";
    AuditAction["DELETE"] = "DELETE";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
//# sourceMappingURL=auth.enums.js.map