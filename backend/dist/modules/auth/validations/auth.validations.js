"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenSchema = exports.ResendCodeSchema = exports.VerifySchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
exports.RegisterSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2, "Le nom complet doit contenir au moins 2 caractères"),
    email: zod_1.z.string().email("L'adresse email est invalide"),
    phone: zod_1.z.string().optional(),
    password: zod_1.z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").optional(),
    roleCode: zod_1.z.string().min(1, "Le code du rôle est requis"),
    territoryId: zod_1.z.string().uuid("L'identifiant du territoire doit être un UUID valide").optional(),
    organizationId: zod_1.z.string().uuid("L'identifiant de l'organisation doit être un UUID valide").optional(),
});
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email("L'adresse email est invalide"),
    password: zod_1.z.string().min(1, "Le mot de passe est requis"),
});
exports.VerifySchema = zod_1.z.object({
    email: zod_1.z.string().email("L'adresse email est invalide"),
    code: zod_1.z.string().length(6, "Le code OTP doit contenir exactement 6 chiffres").regex(/^\d+$/, "Le code doit être composé uniquement de chiffres"),
    password: zod_1.z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: zod_1.z.string().min(8, "La confirmation du mot de passe est requise"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
});
exports.ResendCodeSchema = zod_1.z.object({
    email: zod_1.z.string().email("L'adresse email est invalide"),
});
exports.RefreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1, "Le Refresh Token est requis"),
});
//# sourceMappingURL=auth.validations.js.map