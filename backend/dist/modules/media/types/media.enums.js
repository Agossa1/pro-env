"use strict";
/*
 * |--------------------------------------------------------------------------
 * | MEDIA ENUMS
 * |--------------------------------------------------------------------------
 * | Types de médias et modules applicatifs auxquels ils peuvent être liés.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaModule = exports.MediaType = void 0;
var MediaType;
(function (MediaType) {
    MediaType["IMAGE"] = "image";
    MediaType["DOCUMENT"] = "document";
    MediaType["VIDEO"] = "video";
    MediaType["OTHER"] = "other";
})(MediaType || (exports.MediaType = MediaType = {}));
var MediaModule;
(function (MediaModule) {
    MediaModule["TERRITORY"] = "territory";
    MediaModule["REPORTS"] = "reports";
    MediaModule["MISSIONS"] = "missions";
    MediaModule["INTERVENTIONS"] = "interventions";
    MediaModule["INFRASTRUCTURES"] = "infrastructures";
    MediaModule["SOCIETES"] = "societes";
})(MediaModule || (exports.MediaModule = MediaModule = {}));
//# sourceMappingURL=media.enums.js.map