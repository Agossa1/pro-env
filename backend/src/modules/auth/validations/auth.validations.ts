import { z } from 'zod';

export const RegisterSchema = z.object({
  fullName: z.string().min(2, "Le nom complet doit contenir au moins 2 caractères"),
  email: z.string().email("L'adresse email est invalide"),
  phone: z.string().optional(),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").optional(),
  roleCode: z.string().min(1, "Le code du rôle est requis"),
  territoryId: z.string().uuid("L'identifiant du territoire doit être un UUID valide").optional(),
  organizationId: z.string().uuid("L'identifiant de l'organisation doit être un UUID valide").optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("L'adresse email est invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const VerifySchema = z.object({
  email: z.string().email("L'adresse email est invalide"),
  code: z.string().length(6, "Le code OTP doit contenir exactement 6 chiffres").regex(/^\d+$/, "Le code doit être composé uniquement de chiffres"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(8, "La confirmation du mot de passe est requise"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

export const ResendCodeSchema = z.object({
  email: z.string().email("L'adresse email est invalide"),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Le Refresh Token est requis"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("L'adresse email est invalide"),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email("L'adresse email est invalide"),
  code: z.string().length(6, "Le code OTP doit contenir exactement 6 chiffres").regex(/^\d+$/, "Le code doit être composé uniquement de chiffres"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(8, "La confirmation du mot de passe est requise"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});
