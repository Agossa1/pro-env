"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initInfrastructureModule = void 0;
const logger_1 = require("../../config/loggers/logger");
// Repositories
const infrastructure_repositories_1 = require("./repositories/infrastructure.repositories");
// Services
const getInfrastructures_service_1 = require("./services/getInfrastructures.service");
const getInfrastructureById_service_1 = require("./services/getInfrastructureById.service");
const createInfrastructure_service_1 = require("./services/createInfrastructure.service");
const updateInfrastructure_service_1 = require("./services/updateInfrastructure.service");
const deleteInfrastructure_service_1 = require("./services/deleteInfrastructure.service");
// Controllers
const getInfrastructures_controller_1 = require("./controller/getInfrastructures.controller");
const getInfrastructureById_controller_1 = require("./controller/getInfrastructureById.controller");
const createInfrastructure_controller_1 = require("./controller/createInfrastructure.controller");
const updateInfrastructure_controller_1 = require("./controller/updateInfrastructure.controller");
const deleteInfrastructure_controller_1 = require("./controller/deleteInfrastructure.controller");
// Routes
const infrastructure_route_1 = require("./routes/infrastructure.route");
const initInfrastructureModule = (db) => {
    // 1. Initialiser le Repository
    const infrastructureRepository = new infrastructure_repositories_1.InfrastructureRepository(db, logger_1.logger);
    // 2. Initialiser les Services Métiers
    const getInfrastructuresService = new getInfrastructures_service_1.GetInfrastructuresService(infrastructureRepository, logger_1.logger);
    const getInfrastructureByIdService = new getInfrastructureById_service_1.GetInfrastructureByIdService(infrastructureRepository, logger_1.logger);
    const createInfrastructureService = new createInfrastructure_service_1.CreateInfrastructureService(infrastructureRepository, logger_1.logger);
    const updateInfrastructureService = new updateInfrastructure_service_1.UpdateInfrastructureService(infrastructureRepository, logger_1.logger);
    const deleteInfrastructureService = new deleteInfrastructure_service_1.DeleteInfrastructureService(infrastructureRepository, logger_1.logger);
    // 3. Initialiser les Contrôleurs
    const getInfrastructuresController = new getInfrastructures_controller_1.GetInfrastructuresController(getInfrastructuresService);
    const getInfrastructureByIdController = new getInfrastructureById_controller_1.GetInfrastructureByIdController(getInfrastructureByIdService);
    const createInfrastructureController = new createInfrastructure_controller_1.CreateInfrastructureController(createInfrastructureService);
    const updateInfrastructureController = new updateInfrastructure_controller_1.UpdateInfrastructureController(updateInfrastructureService);
    const deleteInfrastructureController = new deleteInfrastructure_controller_1.DeleteInfrastructureController(deleteInfrastructureService);
    // 4. Lier les Contrôleurs aux Routes
    const infrastructureRoutes = new infrastructure_route_1.InfrastructureRoutes(getInfrastructuresController, getInfrastructureByIdController, createInfrastructureController, updateInfrastructureController, deleteInfrastructureController);
    return infrastructureRoutes.router;
};
exports.initInfrastructureModule = initInfrastructureModule;
//# sourceMappingURL=infrastructure.module.js.map