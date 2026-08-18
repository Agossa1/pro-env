"use strict";
/*
 * |--------------------------------------------------------------------------
 * | SOCIETE VALIDATIONS
 * |--------------------------------------------------------------------------
 * | Schémas Zod pour les entrées du module Societes.
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationNumberParamSchema = exports.IdParamSchema = exports.UpdateSocieteSchema = exports.CreateSocieteSchema = void 0;
const zod_1 = require("zod");
const societe_enums_1 = require("../types/societe.enums");
/** Liste des types valides pour une société */
const TypeEnum = zod_1.z.enum(Object.values(societe_enums_1.SocieteType));
exports.CreateSocieteSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Le nom est requis').max(255, 'Le nom ne doit pas dépasser 255 caractères'),
    type: TypeEnum,
    registrationNumber: zod_1.z
        .string()
        .max(100, 'Le n° d\'enregistrement ne doit pas dépasser 100 caractères')
        .nullable()
        .optional(),
    contactEmail: zod_1.z.string().email('Email invalide'),
    contactPhone: zod_1.z.string().max(20, 'Le téléphone ne doit pas dépasser 20 caractères').nullable().optional(),
    isActive: zod_1.z.boolean().optional(),
    // Territoire (mairie/commune ou ministère) auquel associer la société.
    // Optionnel : si absent, on utilise le territoire de l'utilisateur connecté.
    territoryId: zod_1.z
        .string()
        .uuid("Le territoire d'association doit être un UUID valide")
        .nullable()
        .optional(),
});
exports.UpdateSocieteSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Le nom est requis').max(255).optional(),
    type: TypeEnum.optional(),
    registrationNumber: zod_1.z.string().max(100).nullable().optional(),
    contactEmail: zod_1.z.string().email('Email invalide').nullable().optional(),
    contactPhone: zod_1.z.string().max(20).nullable().optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.IdParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("L'identifiant doit être un UUID valide"),
});
exports.RegistrationNumberParamSchema = zod_1.z.object({
    registrationNumber: zod_1.z.string().min(1, 'Le n° d\'enregistrement est requis'),
});
//# sourceMappingURL=societe.validations.js.map