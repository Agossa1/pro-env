"use strict";
/*
|--------------------------------------------------------------------------
| DELETE USER SERVICE
|--------------------------------------------------------------------------
| Service métier pour la suppression définitive d'un utilisateur.
|--------------------------------------------------------------------------
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUserService = void 0;
class DeleteUserService {
    constructor(authRepository, logger) {
        this.authRepository = authRepository;
        this.logger = logger;
    }
    async execute(userId) {
        try {
            await this.authRepository.deleteUser(userId);
            this.logger.info(`Utilisateur ${userId} supprimé définitivement.`);
        }
        catch (error) {
            this.logger.error(`Erreur deleteUser (service): ${error.message}`);
            throw error;
        }
    }
}
exports.DeleteUserService = DeleteUserService;
//# sourceMappingURL=deleteUser.service.js.map