"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocieteModule = void 0;
const logger_1 = require("../../config/loggers/logger");
// Repositories
const societe_repositories_1 = require("./repositories/societe.repositories");
// Services
const getSocietes_service_1 = require("./services/getSocietes.service");
const getSocieteById_service_1 = require("./services/getSocieteById.service");
const getSocieteByRegistrationNumber_service_1 = require("./services/getSocieteByRegistrationNumber.service");
const createSociete_service_1 = require("./services/createSociete.service");
const updateSociete_service_1 = require("./services/updateSociete.service");
const deleteSociete_service_1 = require("./services/deleteSociete.service");
const getSocieteTerritories_service_1 = require("./services/getSocieteTerritories.service");
// Controllers
const getSocietes_controller_1 = require("./controller/getSocietes.controller");
const getSocieteById_controller_1 = require("./controller/getSocieteById.controller");
const getSocieteByRegistrationNumber_controller_1 = require("./controller/getSocieteByRegistrationNumber.controller");
const createSociete_controller_1 = require("./controller/createSociete.controller");
const updateSociete_controller_1 = require("./controller/updateSociete.controller");
const deleteSociete_controller_1 = require("./controller/deleteSociete.controller");
const getSocieteTerritories_controller_1 = require("./controller/getSocieteTerritories.controller");
// Routes
const societe_route_1 = require("./routes/societe.route");
const initSocieteModule = (db) => {
    // 1. Initialiser le Repository
    const societeRepository = new societe_repositories_1.SocieteRepository(db, logger_1.logger);
    // 2. Initialiser les Services Métiers
    const getSocietesService = new getSocietes_service_1.GetSocietesService(societeRepository, logger_1.logger);
    const getSocieteByIdService = new getSocieteById_service_1.GetSocieteByIdService(societeRepository, logger_1.logger);
    const getSocieteByRegistrationNumberService = new getSocieteByRegistrationNumber_service_1.GetSocieteByRegistrationNumberService(societeRepository, logger_1.logger);
    const createSocieteService = new createSociete_service_1.CreateSocieteService(societeRepository, logger_1.logger);
    const updateSocieteService = new updateSociete_service_1.UpdateSocieteService(societeRepository, logger_1.logger);
    const deleteSocieteService = new deleteSociete_service_1.DeleteSocieteService(societeRepository, logger_1.logger);
    const getSocieteTerritoriesService = new getSocieteTerritories_service_1.GetSocieteTerritoriesService(societeRepository, logger_1.logger);
    // 3. Initialiser les Contrôleurs
    const getSocietesController = new getSocietes_controller_1.GetSocietesController(getSocietesService);
    const getSocieteByIdController = new getSocieteById_controller_1.GetSocieteByIdController(getSocieteByIdService);
    const getSocieteByRegistrationNumberController = new getSocieteByRegistrationNumber_controller_1.GetSocieteByRegistrationNumberController(getSocieteByRegistrationNumberService);
    const createSocieteController = new createSociete_controller_1.CreateSocieteController(createSocieteService);
    const updateSocieteController = new updateSociete_controller_1.UpdateSocieteController(updateSocieteService);
    const deleteSocieteController = new deleteSociete_controller_1.DeleteSocieteController(deleteSocieteService);
    const getSocieteTerritoriesController = new getSocieteTerritories_controller_1.GetSocieteTerritoriesController(getSocieteTerritoriesService);
    // 4. Lier les Contrôleurs aux Routes
    const societeRoutes = new societe_route_1.SocieteRoutes(getSocietesController, getSocieteByIdController, getSocieteByRegistrationNumberController, createSocieteController, updateSocieteController, deleteSocieteController, getSocieteTerritoriesController);
    return societeRoutes.router;
};
exports.initSocieteModule = initSocieteModule;
//# sourceMappingURL=societe.module.js.map