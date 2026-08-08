"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initTerritoryModule = void 0;
const logger_1 = require("../../config/loggers/logger");
// Repositories
const territory_repositories_1 = require("./repositories/territory.repositories");
// Services — Territory Types
const getTerritoryTypes_service_1 = require("./services/getTerritoryTypes.service");
const getTerritoryTypeByCode_service_1 = require("./services/getTerritoryTypeByCode.service");
const getTerritoryTypeById_service_1 = require("./services/getTerritoryTypeById.service");
const createTerritoryType_service_1 = require("./services/createTerritoryType.service");
const updateTerritoryType_service_1 = require("./services/updateTerritoryType.service");
const deleteTerritoryType_service_1 = require("./services/deleteTerritoryType.service");
// Services — Territories
const createTerritory_service_1 = require("./services/createTerritory.service");
const getAllTerritories_service_1 = require("./services/getAllTerritories.service");
const getTerritoryById_service_1 = require("./services/getTerritoryById.service");
const getTerritoryByCode_service_1 = require("./services/getTerritoryByCode.service");
// Controllers — Territory Types
const getTerritoryTypes_controller_1 = require("./controller/getTerritoryTypes.controller");
const getTerritoryTypeByCode_controller_1 = require("./controller/getTerritoryTypeByCode.controller");
const getTerritoryTypeById_controller_1 = require("./controller/getTerritoryTypeById.controller");
const createTerritoryType_controller_1 = require("./controller/createTerritoryType.controller");
const updateTerritoryType_controller_1 = require("./controller/updateTerritoryType.controller");
const deleteTerritoryType_controller_1 = require("./controller/deleteTerritoryType.controller");
// Controllers — Territories
const createTerritory_controller_1 = require("./controller/createTerritory.controller");
const getAllTerritories_controller_1 = require("./controller/getAllTerritories.controller");
const getTerritoryById_controller_1 = require("./controller/getTerritoryById.controller");
const getTerritoryByCode_controller_1 = require("./controller/getTerritoryByCode.controller");
// Routes
const territory_route_1 = require("./routes/territory.route");
const initTerritoryModule = (db) => {
    // 1. Initialiser le Repository
    const territoryRepository = new territory_repositories_1.TerritoryRepository(db, logger_1.logger);
    // 2. Initialiser les Services Métiers — Territory Types
    const getTerritoryTypesService = new getTerritoryTypes_service_1.GetTerritoryTypesService(territoryRepository, logger_1.logger);
    const getTerritoryTypeByCodeService = new getTerritoryTypeByCode_service_1.GetTerritoryTypeByCodeService(territoryRepository, logger_1.logger);
    const getTerritoryTypeByIdService = new getTerritoryTypeById_service_1.GetTerritoryTypeByIdService(territoryRepository, logger_1.logger);
    const createTerritoryTypeService = new createTerritoryType_service_1.CreateTerritoryTypeService(territoryRepository, logger_1.logger);
    const updateTerritoryTypeService = new updateTerritoryType_service_1.UpdateTerritoryTypeService(territoryRepository, logger_1.logger);
    const deleteTerritoryTypeService = new deleteTerritoryType_service_1.DeleteTerritoryTypeService(territoryRepository, logger_1.logger);
    // 2b. Services Métiers — Territories
    const createTerritoryService = new createTerritory_service_1.CreateTerritoryService(territoryRepository, logger_1.logger);
    const getAllTerritoriesService = new getAllTerritories_service_1.GetAllTerritoriesService(territoryRepository, logger_1.logger);
    const getTerritoryByIdService = new getTerritoryById_service_1.GetTerritoryByIdService(territoryRepository, logger_1.logger);
    const getTerritoryByCodeService = new getTerritoryByCode_service_1.GetTerritoryByCodeService(territoryRepository, logger_1.logger);
    // 3. Initialiser les Contrôleurs — Territory Types
    const getTerritoryTypesController = new getTerritoryTypes_controller_1.GetTerritoryTypesController(getTerritoryTypesService);
    const getTerritoryTypeByCodeController = new getTerritoryTypeByCode_controller_1.GetTerritoryTypeByCodeController(getTerritoryTypeByCodeService);
    const getTerritoryTypeByIdController = new getTerritoryTypeById_controller_1.GetTerritoryTypeByIdController(getTerritoryTypeByIdService);
    const createTerritoryTypeController = new createTerritoryType_controller_1.CreateTerritoryTypeController(createTerritoryTypeService);
    const updateTerritoryTypeController = new updateTerritoryType_controller_1.UpdateTerritoryTypeController(updateTerritoryTypeService);
    const deleteTerritoryTypeController = new deleteTerritoryType_controller_1.DeleteTerritoryTypeController(deleteTerritoryTypeService);
    // 3b. Contrôleurs — Territories
    const createTerritoryController = new createTerritory_controller_1.CreateTerritoryController(createTerritoryService);
    const getAllTerritoriesController = new getAllTerritories_controller_1.GetAllTerritoriesController(getAllTerritoriesService);
    const getTerritoryByIdController = new getTerritoryById_controller_1.GetTerritoryByIdController(getTerritoryByIdService);
    const getTerritoryByCodeController = new getTerritoryByCode_controller_1.GetTerritoryByCodeController(getTerritoryByCodeService);
    // 4. Lier les Contrôleurs aux Routes
    const territoryRoutes = new territory_route_1.TerritoryRoutes(createTerritoryController, getTerritoryTypesController, getTerritoryTypeByCodeController, getTerritoryTypeByIdController, createTerritoryTypeController, updateTerritoryTypeController, deleteTerritoryTypeController, getAllTerritoriesController, getTerritoryByIdController, getTerritoryByCodeController);
    return territoryRoutes.router;
};
exports.initTerritoryModule = initTerritoryModule;
//# sourceMappingURL=territory.module.js.map