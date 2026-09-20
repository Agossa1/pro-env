"use strict";
/*
|--------------------------------------------------------------------------
| UPDATE USER SERVICE
|--------------------------------------------------------------------------
| Service métier pour la mise à jour d'un utilisateur.
|--------------------------------------------------------------------------
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserService = void 0;
class UpdateUserService {
    constructor(authRepository, logger) {
        this.authRepository = authRepository;
        this.logger = logger;
    }
    async execute(userId, payload) {
        try {
            if (Object.keys(payload).length === 0) {
                this.logger.warn(`updateUser: aucun champ à mettre à jour pour l'utilisateur ${userId}`);
                return;
            }
            await this.authRepository.updateUser(userId, payload);
            this.logger.info(`Utilisateur ${userId} mis à jour avec succès.`);
        }
        catch (error) {
            this.logger.error(`Erreur updateUser (service): ${error.message}`);
            throw error;
        }
    }
}
exports.UpdateUserService = UpdateUserService;
//# sourceMappingURL=updateUser.service.js.map