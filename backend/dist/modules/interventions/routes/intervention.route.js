"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterventionRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
class InterventionRoutes {
    constructor(getInterventionsController, getInterventionByIdController, createInterventionController, updateInterventionController, deleteInterventionController, createFieldReportController, getInterventionReportsController) {
        this.getInterventionsController = getInterventionsController;
        this.getInterventionByIdController = getInterventionByIdController;
        this.createInterventionController = createInterventionController;
        this.updateInterventionController = updateInterventionController;
        this.deleteInterventionController = deleteInterventionController;
        this.createFieldReportController = createFieldReportController;
        this.getInterventionReportsController = getInterventionReportsController;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // ── Routes protégées par authentification ──────────────────────────────
        this.router.use(auth_middleware_1.authMiddleware);
        // GET /api/interventions — liste paginée (filtres ?missionId=&teamId=&status=)
        this.router.get('/', this.getInterventionsController.getInterventions);
        // GET /api/interventions/:id/reports — rapports terrain d'une intervention
        this.router.get('/:id/reports', this.getInterventionReportsController.getInterventionReports);
        // POST /api/interventions/:id/reports — créer un rapport terrain
        this.router.post('/:id/reports', this.createFieldReportController.createFieldReport);
        // GET /api/interventions/:id — détail d'une intervention
        this.router.get('/:id', this.getInterventionByIdController.getInterventionById);
        // POST /api/interventions — création
        this.router.post('/', this.createInterventionController.createIntervention);
        // PUT /api/interventions/:id — mise à jour (statut, notes, dates)
        this.router.put('/:id', this.updateInterventionController.updateIntervention);
        // DELETE /api/interventions/:id — suppression logique
        this.router.delete('/:id', this.deleteInterventionController.deleteIntervention);
    }
}
exports.InterventionRoutes = InterventionRoutes;
//# sourceMappingURL=intervention.route.js.map