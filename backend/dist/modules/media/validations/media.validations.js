"use strict";
/*
 * |--------------------------------------------------------------------------
 * | MEDIA VALIDATIONS
 * |--------------------------------------------------------------------------
 * | Schémas Zod pour les entrées du module Media.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityIdParamSchema = exports.IdParamSchema = exports.UploadMediaSchema = void 0;
const zod_1 = require("zod");
const media_enums_1 = require("../types/media.enums");
const ModuleEnum = zod_1.z.enum(Object.values(media_enums_1.MediaModule));
exports.UploadMediaSchema = zod_1.z.object({
    module: ModuleEnum.nullable().optional(),
    entityId: zod_1.z.string().uuid("L'entité doit être un UUID valide").nullable().optional(),
});
exports.IdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("L'identifiant doit être un UUID valide"),
});
exports.EntityIdParamSchema = zod_1.z.object({
    entityId: zod_1.z.string().uuid("L'entité doit être un UUID valide"),
});
//# sourceMappingURL=media.validations.js.map