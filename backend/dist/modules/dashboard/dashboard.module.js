"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDashboardModule = void 0;
const logger_1 = require("../../config/loggers/logger");
// Repository
const dashboard_repositories_1 = require("./repositories/dashboard.repositories");
// Services
const getKpis_service_1 = require("./services/getKpis.service");
const getActivityChart_service_1 = require("./services/getActivityChart.service");
const getReportsByCategory_service_1 = require("./services/getReportsByCategory.service");
const getReportsByStatus_service_1 = require("./services/getReportsByStatus.service");
const getPriorityMissions_service_1 = require("./services/getPriorityMissions.service");
const getRecentInterventions_service_1 = require("./services/getRecentInterventions.service");
const getRecentReports_service_1 = require("./services/getRecentReports.service");
// Controllers
const getKpis_controller_1 = require("./controllers/getKpis.controller");
const getActivityChart_controller_1 = require("./controllers/getActivityChart.controller");
const getReportsByCategory_controller_1 = require("./controllers/getReportsByCategory.controller");
const getReportsByStatus_controller_1 = require("./controllers/getReportsByStatus.controller");
const getPriorityMissions_controller_1 = require("./controllers/getPriorityMissions.controller");
const getRecentInterventions_controller_1 = require("./controllers/getRecentInterventions.controller");
const getRecentReports_controller_1 = require("./controllers/getRecentReports.controller");
// Routes
const dashboard_route_1 = require("./routes/dashboard.route");
const initDashboardModule = (db) => {
    // 1. Initialiser le Repository
    const dashboardRepository = new dashboard_repositories_1.DashboardRepository(db, logger_1.logger);
    // 2. Initialiser les Services Métiers
    const getKpisService = new getKpis_service_1.GetKpisService(dashboardRepository, logger_1.logger);
    const getActivityChartService = new getActivityChart_service_1.GetActivityChartService(dashboardRepository, logger_1.logger);
    const getReportsByCategoryService = new getReportsByCategory_service_1.GetReportsByCategoryService(dashboardRepository, logger_1.logger);
    const getReportsByStatusService = new getReportsByStatus_service_1.GetReportsByStatusService(dashboardRepository, logger_1.logger);
    const getPriorityMissionsService = new getPriorityMissions_service_1.GetPriorityMissionsService(dashboardRepository, logger_1.logger);
    const getRecentInterventionsService = new getRecentInterventions_service_1.GetRecentInterventionsService(dashboardRepository, logger_1.logger);
    const getRecentReportsService = new getRecentReports_service_1.GetRecentReportsService(dashboardRepository, logger_1.logger);
    // 3. Initialiser les Contrôleurs
    const getKpisController = new getKpis_controller_1.GetKpisController(getKpisService);
    const getActivityChartController = new getActivityChart_controller_1.GetActivityChartController(getActivityChartService);
    const getReportsByCategoryController = new getReportsByCategory_controller_1.GetReportsByCategoryController(getReportsByCategoryService);
    const getReportsByStatusController = new getReportsByStatus_controller_1.GetReportsByStatusController(getReportsByStatusService);
    const getPriorityMissionsController = new getPriorityMissions_controller_1.GetPriorityMissionsController(getPriorityMissionsService);
    const getRecentInterventionsController = new getRecentInterventions_controller_1.GetRecentInterventionsController(getRecentInterventionsService);
    const getRecentReportsController = new getRecentReports_controller_1.GetRecentReportsController(getRecentReportsService);
    // 4. Lier les Contrôleurs aux Routes
    const dashboardRoutes = new dashboard_route_1.DashboardRoutes(getKpisController, getActivityChartController, getReportsByCategoryController, getReportsByStatusController, getPriorityMissionsController, getRecentInterventionsController, getRecentReportsController);
    return dashboardRoutes.router;
};
exports.initDashboardModule = initDashboardModule;
//# sourceMappingURL=dashboard.module.js.map