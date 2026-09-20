"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterController = void 0;
const zod_1 = require("zod");
const auth_validations_1 = require("../validations/auth.validations");
class RegisterController {
    constructor(registerService) {
        this.registerService = registerService;
        /**
         * Auto-inscription publique (rôle citoyen uniquement).
         * POST /auth/register — non authentifié.
         */
        this.register = async (req, res, next) => {
            try {
                // 1. Validation des données d'entrée
                const payload = auth_validations_1.RegisterSchema.parse(req.body);
                // 2. Construction du contexte créateur (auto-inscription publique)
                const creatorContext = {
                    id: '',
                    userId: '',
                    email: '',
                    roleCode: 'citoyen',
                    roleTier: null,
                    regionId: null,
                    municipalityId: null,
                    districtId: null,
                    neighborhoodId: null,
                    organizationId: null,
                    roles: [],
                };
                // 3. Appel au service métier
                const user = await this.registerService.registerUser(payload, creatorContext);
                // 4. Réponse standardisée
                res.status(201).json({
                    success: true,
                    message: 'Utilisateur créé avec succès. Un code de vérification a été envoyé à votre adresse email.',
                    data: {
                        id: user.id,
                        email: user.email,
                        fullName: user.fullName
                    }
                });
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json({
                        success: false,
                        message: 'Erreur de validation des données.',
                        errors: error.issues
                    });
                    return;
                }
                next(error);
            }
        };
        /**
         * Création d'un utilisateur par un administrateur connecté.
         * POST /auth/register-admin — protégé par authMiddleware (req.user).
         */
        this.registerAdmin = async (req, res, next) => {
            try {
                // 1. Validation des données d'entrée
                const payload = auth_validations_1.RegisterSchema.parse(req.body);
                // 2. Contexte créateur = utilisateur connecté (injecté par authMiddleware)
                const creatorContext = req.user;
                if (!creatorContext?.userId) {
                    res.status(401).json({
                        success: false,
                        message: 'Authentification requise pour créer un utilisateur.',
                    });
                    return;
                }
                // 3. Appel au service métier (applyCreationRules applique le RBAC selon le créateur)
                const user = await this.registerService.registerUser(payload, creatorContext);
                // 4. Réponse standardisée
                res.status(201).json({
                    success: true,
                    message: 'Utilisateur créé avec succès. Un code de vérification a été envoyé à son adresse email.',
                    data: {
                        id: user.id,
                        email: user.email,
                        fullName: user.fullName
                    }
                });
            }
            catch (error) {
                if (error instanceof zod_1.z.ZodError) {
                    res.status(400).json({
                        success: false,
                        message: 'Erreur de validation des données.',
                        errors: error.issues
                    });
                    return;
                }
                next(error);
            }
        };
    }
}
exports.RegisterController = RegisterController;
//# sourceMappingURL=register.controller.js.map