"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initInterventionModule = void 0;
const logger_1 = require("../../config/loggers/logger");
// Repositories
const intervention_repositories_1 = require("./repositories/intervention.repositories");
// Services
const getInterventions_service_1 = require("./services/getInterventions.service");
const getInterventionById_service_1 = require("./services/getInterventionById.service");
const createIntervention_service_1 = require("./services/createIntervention.service");
const updateIntervention_service_1 = require("./services/updateIntervention.service");
const deleteIntervention_service_1 = require("./services/deleteIntervention.service");
const createFieldReport_service_1 = require("./services/createFieldReport.service");
const getInterventionReports_service_1 = require("./services/getInterventionReports.service");
// Controllers
const getInterventions_controller_1 = require("./controller/getInterventions.controller");
const getInterventionById_controller_1 = require("./controller/getInterventionById.controller");
const createIntervention_controller_1 = require("./controller/createIntervention.controller");
const updateIntervention_controller_1 = require("./controller/updateIntervention.controller");
const deleteIntervention_controller_1 = require("./controller/deleteIntervention.controller");
const createFieldReport_controller_1 = require("./controller/createFieldReport.controller");
const getInterventionReports_controller_1 = require("./controller/getInterventionReports.controller");
// Routes
const intervention_route_1 = require("./routes/intervention.route");
const initInterventionModule = (db) => {
    // 1. Initialiser le Repository
    const interventionRepository = new intervention_repositories_1.InterventionRepository(db, logger_1.logger);
    // 2. Initialiser les Services Métiers
    const getInterventionsService = new getInterventions_service_1.GetInterventionsService(interventionRepository, logger_1.logger);
    const getInterventionByIdService = new getInterventionById_service_1.GetInterventionByIdService(interventionRepository, logger_1.logger);
    const createInterventionService = new createIntervention_service_1.CreateInterventionService(interventionRepository, logger_1.logger);
    const updateInterventionService = new updateIntervention_service_1.UpdateInterventionService(interventionRepository, logger_1.logger);
    const deleteInterventionService = new deleteIntervention_service_1.DeleteInterventionService(interventionRepository, logger_1.logger);
    const createFieldReportService = new createFieldReport_service_1.CreateFieldReportService(interventionRepository, logger_1.logger);
    const getInterventionReportsService = new getInterventionReports_service_1.GetInterventionReportsService(interventionRepository, logger_1.logger);
    // 3. Initialiser les Contrôleurs
    const getInterventionsController = new getInterventions_controller_1.GetInterventionsController(getInterventionsService);
    const getInterventionByIdController = new getInterventionById_controller_1.GetInterventionByIdController(getInterventionByIdService);
    const createInterventionController = new createIntervention_controller_1.CreateInterventionController(createInterventionService);
    const updateInterventionController = new updateIntervention_controller_1.UpdateInterventionController(updateInterventionService);
    const deleteInterventionController = new deleteIntervention_controller_1.DeleteInterventionController(deleteInterventionService);
    const createFieldReportController = new createFieldReport_controller_1.CreateFieldReportController(createFieldReportService);
    const getInterventionReportsController = new getInterventionReports_controller_1.GetInterventionReportsController(getInterventionReportsService);
    // 4. Lier les Contrôleurs aux Routes
    const interventionRoutes = new intervention_route_1.InterventionRoutes(getInterventionsController, getInterventionByIdController, createInterventionController, updateInterventionController, deleteInterventionController, createFieldReportController, getInterventionReportsController);
    return interventionRoutes.router;
};
exports.initInterventionModule = initInterventionModule;
//# sourceMappingURL=intervention.module.js.map