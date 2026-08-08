import { Router } from 'express';
import PostgresDatabase from '../../config/database/postgres';
import { logger } from '../../config/loggers/logger';

// Repositories
import { TerritoryRepository } from './repositories/territory.repositories';

// Services — Territory Types
import { GetTerritoryTypesService } from './services/getTerritoryTypes.service';
import { GetTerritoryTypeByCodeService } from './services/getTerritoryTypeByCode.service';
import { GetTerritoryTypeByIdService } from './services/getTerritoryTypeById.service';
import { CreateTerritoryTypeService } from './services/createTerritoryType.service';
import { UpdateTerritoryTypeService } from './services/updateTerritoryType.service';
import { DeleteTerritoryTypeService } from './services/deleteTerritoryType.service';

// Services — Territories
import { CreateTerritoryService } from './services/createTerritory.service';
import { GetAllTerritoriesService } from './services/getAllTerritories.service';
import { GetTerritoryByIdService } from './services/getTerritoryById.service';
import { GetTerritoryByCodeService } from './services/getTerritoryByCode.service';

// Controllers — Territory Types
import { GetTerritoryTypesController } from './controller/getTerritoryTypes.controller';
import { GetTerritoryTypeByCodeController } from './controller/getTerritoryTypeByCode.controller';
import { GetTerritoryTypeByIdController } from './controller/getTerritoryTypeById.controller';
import { CreateTerritoryTypeController } from './controller/createTerritoryType.controller';
import { UpdateTerritoryTypeController } from './controller/updateTerritoryType.controller';
import { DeleteTerritoryTypeController } from './controller/deleteTerritoryType.controller';

// Controllers — Territories
import { CreateTerritoryController } from './controller/createTerritory.controller';
import { GetAllTerritoriesController } from './controller/getAllTerritories.controller';
import { GetTerritoryByIdController } from './controller/getTerritoryById.controller';
import { GetTerritoryByCodeController } from './controller/getTerritoryByCode.controller';

// Routes
import { TerritoryRoutes } from './routes/territory.route';

export const initTerritoryModule = (db: PostgresDatabase): Router => {
  // 1. Initialiser le Repository
  const territoryRepository = new TerritoryRepository(db, logger);

  // 2. Initialiser les Services Métiers — Territory Types
  const getTerritoryTypesService = new GetTerritoryTypesService(territoryRepository, logger);
  const getTerritoryTypeByCodeService = new GetTerritoryTypeByCodeService(territoryRepository, logger);
  const getTerritoryTypeByIdService = new GetTerritoryTypeByIdService(territoryRepository, logger);
  const createTerritoryTypeService = new CreateTerritoryTypeService(territoryRepository, logger);
  const updateTerritoryTypeService = new UpdateTerritoryTypeService(territoryRepository, logger);
  const deleteTerritoryTypeService = new DeleteTerritoryTypeService(territoryRepository, logger);

  // 2b. Services Métiers — Territories
  const createTerritoryService = new CreateTerritoryService(territoryRepository, logger);
  const getAllTerritoriesService = new GetAllTerritoriesService(territoryRepository, logger);
  const getTerritoryByIdService = new GetTerritoryByIdService(territoryRepository, logger);
  const getTerritoryByCodeService = new GetTerritoryByCodeService(territoryRepository, logger);

  // 3. Initialiser les Contrôleurs — Territory Types
  const getTerritoryTypesController = new GetTerritoryTypesController(getTerritoryTypesService);
  const getTerritoryTypeByCodeController = new GetTerritoryTypeByCodeController(getTerritoryTypeByCodeService);
  const getTerritoryTypeByIdController = new GetTerritoryTypeByIdController(getTerritoryTypeByIdService);
  const createTerritoryTypeController = new CreateTerritoryTypeController(createTerritoryTypeService);
  const updateTerritoryTypeController = new UpdateTerritoryTypeController(updateTerritoryTypeService);
  const deleteTerritoryTypeController = new DeleteTerritoryTypeController(deleteTerritoryTypeService);

  // 3b. Contrôleurs — Territories
  const createTerritoryController = new CreateTerritoryController(createTerritoryService);
  const getAllTerritoriesController = new GetAllTerritoriesController(getAllTerritoriesService);
  const getTerritoryByIdController = new GetTerritoryByIdController(getTerritoryByIdService);
  const getTerritoryByCodeController = new GetTerritoryByCodeController(getTerritoryByCodeService);

  // 4. Lier les Contrôleurs aux Routes
  const territoryRoutes = new TerritoryRoutes(
    createTerritoryController,
    getTerritoryTypesController,
    getTerritoryTypeByCodeController,
    getTerritoryTypeByIdController,
    createTerritoryTypeController,
    updateTerritoryTypeController,
    deleteTerritoryTypeController,
    getAllTerritoriesController,
    getTerritoryByIdController,
    getTerritoryByCodeController,
  );

  return territoryRoutes.router;
};