import { Router } from 'express';
import PostgresDatabase from '../../config/database/postgres';
import { logger } from '../../config/loggers/logger';

// Repositories
import { InfrastructureRepository } from './repositories/infrastructure.repositories';

// Services
import { GetInfrastructuresService } from './services/getInfrastructures.service';
import { GetInfrastructureByIdService } from './services/getInfrastructureById.service';
import { CreateInfrastructureService } from './services/createInfrastructure.service';
import { UpdateInfrastructureService } from './services/updateInfrastructure.service';
import { DeleteInfrastructureService } from './services/deleteInfrastructure.service';

// Controllers
import { GetInfrastructuresController } from './controller/getInfrastructures.controller';
import { GetInfrastructureByIdController } from './controller/getInfrastructureById.controller';
import { CreateInfrastructureController } from './controller/createInfrastructure.controller';
import { UpdateInfrastructureController } from './controller/updateInfrastructure.controller';
import { DeleteInfrastructureController } from './controller/deleteInfrastructure.controller';

// Routes
import { InfrastructureRoutes } from './routes/infrastructure.route';

export const initInfrastructureModule = (db: PostgresDatabase): Router => {
  // 1. Initialiser le Repository
  const infrastructureRepository = new InfrastructureRepository(db, logger);

  // 2. Initialiser les Services Métiers
  const getInfrastructuresService = new GetInfrastructuresService(infrastructureRepository, logger);
  const getInfrastructureByIdService = new GetInfrastructureByIdService(infrastructureRepository, logger);
  const createInfrastructureService = new CreateInfrastructureService(infrastructureRepository, logger);
  const updateInfrastructureService = new UpdateInfrastructureService(infrastructureRepository, logger);
  const deleteInfrastructureService = new DeleteInfrastructureService(infrastructureRepository, logger);

  // 3. Initialiser les Contrôleurs
  const getInfrastructuresController = new GetInfrastructuresController(getInfrastructuresService);
  const getInfrastructureByIdController = new GetInfrastructureByIdController(getInfrastructureByIdService);
  const createInfrastructureController = new CreateInfrastructureController(createInfrastructureService);
  const updateInfrastructureController = new UpdateInfrastructureController(updateInfrastructureService);
  const deleteInfrastructureController = new DeleteInfrastructureController(deleteInfrastructureService);

  // 4. Lier les Contrôleurs aux Routes
  const infrastructureRoutes = new InfrastructureRoutes(
    getInfrastructuresController,
    getInfrastructureByIdController,
    createInfrastructureController,
    updateInfrastructureController,
    deleteInfrastructureController,
  );

  return infrastructureRoutes.router;
};