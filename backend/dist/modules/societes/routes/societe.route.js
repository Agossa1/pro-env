"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocieteRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
class SocieteRoutes {
    constructor(getSocietesController, getSocieteByIdController, getSocieteByRegistrationNumberController, createSocieteController, updateSocieteController, deleteSocieteController, getSocieteTerritoriesController) {
        this.getSocietesController = getSocietesController;
        this.getSocieteByIdController = getSocieteByIdController;
        this.getSocieteByRegistrationNumberController = getSocieteByRegistrationNumberController;
        this.createSocieteController = createSocieteController;
        this.updateSocieteController = updateSocieteController;
        this.deleteSocieteController = deleteSocieteController;
        this.getSocieteTerritoriesController = getSocieteTerritoriesController;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // ── Routes protégées par authentification ──────────────────────────────
        this.router.use(auth_middleware_1.authMiddleware);
        // GET /api/societes — liste paginée (filtre ?type=)
        this.router.get('/', this.getSocietesController.getSocietes);
        // GET /api/societes/registration/:registrationNumber — par n° d'enregistrement
        // (déclaré avant /:id pour éviter le conflit de route)
        this.router.get('/registration/:registrationNumber', this.getSocieteByRegistrationNumberController.getSocieteByRegistrationNumber);
        // GET /api/societes/:id/territories — territoires de compétence
        this.router.get('/:id/territories', this.getSocieteTerritoriesController.getSocieteTerritories);
        // GET /api/societes/:id — détail
        this.router.get('/:id', this.getSocieteByIdController.getSocieteById);
        // POST /api/societes — création
        this.router.post('/', this.createSocieteController.createSociete);
        // PUT /api/societes/:id — mise à jour
        this.router.put('/:id', this.updateSocieteController.updateSociete);
        // DELETE /api/societes/:id — suppression
        this.router.delete('/:id', this.deleteSocieteController.deleteSociete);
    }
}
exports.SocieteRoutes = SocieteRoutes;
//# sourceMappingURL=societe.route.js.map