"use strict";
/*
|--------------------------------------------------------------------------
| GET USERS SERVICE
|--------------------------------------------------------------------------
| Service métier de récupération paginée de la liste des utilisateurs
| (administration — lecture seule via le module auth).
|--------------------------------------------------------------------------
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUsersService = void 0;
class GetUsersService {
    constructor(authRepository, logger) {
        this.authRepository = authRepository;
        this.logger = logger;
    }
    /**
     * Récupère la liste paginée des utilisateurs.
     * @param query Paramètres de pagination (page, limit)
     */
    async getUsers(query = {}) {
        try {
            const result = await this.authRepository.getAllUsers(query);
            this.logger.info(`Liste des utilisateurs récupérée : ${result.total} résultat(s) - page ${result.page}/${result.totalPages}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Erreur getUsers (service): ${error.message}`);
            throw error;
        }
    }
}
exports.GetUsersService = GetUsersService;
//# sourceMappingURL=getUsers.service.js.map