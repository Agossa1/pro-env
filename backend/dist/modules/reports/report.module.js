"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initReportModule = void 0;
const logger_1 = require("../../config/loggers/logger");
// Repositories
const report_repositories_1 = require("./repositories/report.repositories");
// Services
const getReports_service_1 = require("./services/getReports.service");
const getReportById_service_1 = require("./services/getReportById.service");
const createReport_service_1 = require("./services/createReport.service");
const updateReport_service_1 = require("./services/updateReport.service");
const deleteReport_service_1 = require("./services/deleteReport.service");
const getReportDetails_service_1 = require("./services/getReportDetails.service");
const getReportStatusHistory_service_1 = require("./services/getReportStatusHistory.service");
// Controllers
const getReports_controller_1 = require("./controller/getReports.controller");
const getReportById_controller_1 = require("./controller/getReportById.controller");
const createReport_controller_1 = require("./controller/createReport.controller");
const updateReport_controller_1 = require("./controller/updateReport.controller");
const deleteReport_controller_1 = require("./controller/deleteReport.controller");
const getReportDetails_controller_1 = require("./controller/getReportDetails.controller");
const getReportStatusHistory_controller_1 = require("./controller/getReportStatusHistory.controller");
// Routes
const report_route_1 = require("./routes/report.route");
const initReportModule = (db) => {
    // 1. Initialiser le Repository
    const reportRepository = new report_repositories_1.ReportRepository(db, logger_1.logger);
    // 2. Initialiser les Services Métiers
    const getReportsService = new getReports_service_1.GetReportsService(reportRepository, logger_1.logger);
    const getReportByIdService = new getReportById_service_1.GetReportByIdService(reportRepository, logger_1.logger);
    const createReportService = new createReport_service_1.CreateReportService(reportRepository, logger_1.logger);
    const updateReportService = new updateReport_service_1.UpdateReportService(reportRepository, logger_1.logger);
    const deleteReportService = new deleteReport_service_1.DeleteReportService(reportRepository, logger_1.logger);
    const getReportDetailsService = new getReportDetails_service_1.GetReportDetailsService(reportRepository, logger_1.logger);
    const getReportStatusHistoryService = new getReportStatusHistory_service_1.GetReportStatusHistoryService(reportRepository, logger_1.logger);
    // 3. Initialiser les Contrôleurs
    const getReportsController = new getReports_controller_1.GetReportsController(getReportsService);
    const getReportByIdController = new getReportById_controller_1.GetReportByIdController(getReportByIdService);
    const createReportController = new createReport_controller_1.CreateReportController(createReportService);
    const updateReportController = new updateReport_controller_1.UpdateReportController(updateReportService);
    const deleteReportController = new deleteReport_controller_1.DeleteReportController(deleteReportService);
    const getReportDetailsController = new getReportDetails_controller_1.GetReportDetailsController(getReportDetailsService);
    const getReportStatusHistoryController = new getReportStatusHistory_controller_1.GetReportStatusHistoryController(getReportStatusHistoryService);
    // 4. Lier les Contrôleurs aux Routes
    const reportRoutes = new report_route_1.ReportRoutes(getReportsController, getReportByIdController, createReportController, updateReportController, deleteReportController, getReportDetailsController, getReportStatusHistoryController);
    return reportRoutes.router;
};
exports.initReportModule = initReportModule;
//# sourceMappingURL=report.module.js.map