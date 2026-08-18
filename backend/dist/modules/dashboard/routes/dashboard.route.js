"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
class DashboardRoutes {
    constructor(getKpisController, getActivityChartController, getReportsByCategoryController, getReportsByStatusController, getPriorityMissionsController, getRecentInterventionsController, getRecentReportsController) {
        this.getKpisController = getKpisController;
        this.getActivityChartController = getActivityChartController;
        this.getReportsByCategoryController = getReportsByCategoryController;
        this.getReportsByStatusController = getReportsByStatusController;
        this.getPriorityMissionsController = getPriorityMissionsController;
        this.getRecentInterventionsController = getRecentInterventionsController;
        this.getRecentReportsController = getRecentReportsController;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Toutes les routes dashboard nécessitent une authentification
        this.router.use(auth_middleware_1.authMiddleware);
        this.router.get('/kpis', this.getKpisController.getKpis);
        this.router.get('/activity-chart', this.getActivityChartController.getActivityChart);
        this.router.get('/reports-by-category', this.getReportsByCategoryController.getReportsByCategory);
        this.router.get('/reports-by-status', this.getReportsByStatusController.getReportsByStatus);
        this.router.get('/priority-missions', this.getPriorityMissionsController.getPriorityMissions);
        this.router.get('/recent-interventions', this.getRecentInterventionsController.getRecentInterventions);
        this.router.get('/recent-reports', this.getRecentReportsController.getRecentReports);
    }
}
exports.DashboardRoutes = DashboardRoutes;
//# sourceMappingURL=dashboard.route.js.map