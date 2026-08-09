"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserController = void 0;
const zod_1 = require("zod");
const auth_validations_1 = require("../../auth/validations/auth.validations");
class CreateUserController {
    constructor(usersService) {
        this.usersService = usersService;
        this.execute = async (req, res, next) => {
            try {
                // 1. Validation des données
                const payload = auth_validations_1.RegisterSchema.parse(req.body);
                // 2. Contexte du créateur (le user connecté qui effectue la requête)
                const creatorContext = req.user;
                if (!creatorContext) {
                    res.status(401).json({ success: false, message: 'Non autorisé' });
                    return;
                }
                // 3. Appel au service métier
                const user = await this.usersService.createUser(payload, creatorContext);
                // 4. Réponse
                res.status(201).json({
                    success: true,
                    message: 'Utilisateur créé avec succès. Un email d\'activation a été envoyé.',
                    data: user
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
exports.CreateUserController = CreateUserController;
//# sourceMappingURL=createUser.controller.js.map