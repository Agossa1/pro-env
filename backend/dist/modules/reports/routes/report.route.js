"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
class ReportRoutes {
    constructor(getReportsController, getReportByIdController, createReportController, updateReportController, deleteReportController, getReportDetailsController, getReportStatusHistoryController) {
        this.getReportsController = getReportsController;
        this.getReportByIdController = getReportByIdController;
        this.createReportController = createReportController;
        this.updateReportController = updateReportController;
        this.deleteReportController = deleteReportController;
        this.getReportDetailsController = getReportDetailsController;
        this.getReportStatusHistoryController = getReportStatusHistoryController;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // ── Routes protégées par authentification ──────────────────────────────
        this.router.use(auth_middleware_1.authMiddleware);
        // GET /api/reports — liste paginée (filtres ?territoryId=&status=&issueCategory=)
        this.router.get('/', this.getReportsController.getReports);
        // GET /api/reports/:id/status-history — historique des statuts
        // (déclaré avant /:id pour éviter le conflit)
        this.router.get('/:id/status-history', this.getReportStatusHistoryController.getReportStatusHistory);
        // GET /api/reports/:id/details — détails 1:1 selon la catégorie
        this.router.get('/:id/details', this.getReportDetailsController.getReportDetails);
        // GET /api/reports/:id — détail du rapport
        this.router.get('/:id', this.getReportByIdController.getReportById);
        // POST /api/reports — création
        this.router.post('/', this.createReportController.createReport);
        // PUT /api/reports/:id — mise à jour
        this.router.put('/:id', this.updateReportController.updateReport);
        // DELETE /api/reports/:id — suppression logique
        this.router.delete('/:id', this.deleteReportController.deleteReport);
    }
}
exports.ReportRoutes = ReportRoutes;
//# sourceMappingURL=report.route.js.map