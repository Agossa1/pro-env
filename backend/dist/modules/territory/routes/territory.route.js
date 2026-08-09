"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerritoryRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
class TerritoryRoutes {
    constructor(createTerritoryController, getTerritoryTypesController, getTerritoryTypeByCodeController, getTerritoryTypeByIdController, createTerritoryTypeController, updateTerritoryTypeController, deleteTerritoryTypeController, getAllTerritoriesController, getTerritoryByIdController, getTerritoryByCodeController) {
        this.createTerritoryController = createTerritoryController;
        this.getTerritoryTypesController = getTerritoryTypesController;
        this.getTerritoryTypeByCodeController = getTerritoryTypeByCodeController;
        this.getTerritoryTypeByIdController = getTerritoryTypeByIdController;
        this.createTerritoryTypeController = createTerritoryTypeController;
        this.updateTerritoryTypeController = updateTerritoryTypeController;
        this.deleteTerritoryTypeController = deleteTerritoryTypeController;
        this.getAllTerritoriesController = getAllTerritoriesController;
        this.getTerritoryByIdController = getTerritoryByIdController;
        this.getTerritoryByCodeController = getTerritoryByCodeController;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // ── Routes protégées par authentification ──────────────────────────────
        this.router.use(auth_middleware_1.authMiddleware);
        // ── Territory Types ────────────────────────────────────────────────────
        // GET    /api/territories/types
        this.router.get('/types', this.getTerritoryTypesController.getTerritoryTypes);
        // GET    /api/territories/types/code/:code
        this.router.get('/types/code/:code', this.getTerritoryTypeByCodeController.getTerritoryTypeByCode);
        // GET    /api/territories/types/:id
        this.router.get('/types/:id', this.getTerritoryTypeByIdController.getTerritoryTypeById);
        // POST   /api/territories/types
        this.router.post('/types', this.createTerritoryTypeController.createTerritoryType);
        // PUT    /api/territories/types/:id
        this.router.put('/types/:id', this.updateTerritoryTypeController.updateTerritoryType);
        // DELETE /api/territories/types/:id
        this.router.delete('/types/:id', this.deleteTerritoryTypeController.deleteTerritoryType);
        // ── Territories ────────────────────────────────────────────────────────
        // GET    /api/territories
        this.router.get('/', this.getAllTerritoriesController.getAllTerritories);
        // GET    /api/territories/code/:code
        this.router.get('/code/:code', this.getTerritoryByCodeController.getTerritoryByCode);
        // POST   /api/territories — création d'un territoire (+ GeoJSON uploadé)
        this.router.post('/', this.createTerritoryController.createTerritory);
        // GET    /api/territories/:id
        this.router.get('/:id', this.getTerritoryByIdController.getTerritoryById);
    }
}
exports.TerritoryRoutes = TerritoryRoutes;
//# sourceMappingURL=territory.route.js.map