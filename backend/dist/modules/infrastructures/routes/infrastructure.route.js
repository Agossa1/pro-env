"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfrastructureRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
class InfrastructureRoutes {
    constructor(getInfrastructuresController, getInfrastructureByIdController, createInfrastructureController, updateInfrastructureController, deleteInfrastructureController) {
        this.getInfrastructuresController = getInfrastructuresController;
        this.getInfrastructureByIdController = getInfrastructureByIdController;
        this.createInfrastructureController = createInfrastructureController;
        this.updateInfrastructureController = updateInfrastructureController;
        this.deleteInfrastructureController = deleteInfrastructureController;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // ── Routes protégées par authentification ──────────────────────────────
        this.router.use(auth_middleware_1.authMiddleware);
        // GET /api/infrastructures — liste paginée (filtres ?territoryId=&type=&status=&condition=&search=)
        this.router.get('/', this.getInfrastructuresController.getInfrastructures);
        // GET /api/infrastructures/:id — détail d'une infrastructure
        this.router.get('/:id', this.getInfrastructureByIdController.getInfrastructureById);
        // POST /api/infrastructures — création
        this.router.post('/', this.createInfrastructureController.createInfrastructure);
        // PUT /api/infrastructures/:id — mise à jour
        this.router.put('/:id', this.updateInfrastructureController.updateInfrastructure);
        // DELETE /api/infrastructures/:id — suppression logique
        this.router.delete('/:id', this.deleteInfrastructureController.deleteInfrastructure);
    }
}
exports.InfrastructureRoutes = InfrastructureRoutes;
//# sourceMappingURL=infrastructure.route.js.map