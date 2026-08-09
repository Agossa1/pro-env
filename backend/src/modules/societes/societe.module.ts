import { Router } from 'express';
import PostgresDatabase from '../../config/database/postgres';
import { logger } from '../../config/loggers/logger';

// Repositories
import { SocieteRepository } from './repositories/societe.repositories';

// Services
import { GetSocietesService } from './services/getSocietes.service';
import { GetSocieteByIdService } from './services/getSocieteById.service';
import { GetSocieteByRegistrationNumberService } from './services/getSocieteByRegistrationNumber.service';
import { CreateSocieteService } from './services/createSociete.service';
import { UpdateSocieteService } from './services/updateSociete.service';
import { DeleteSocieteService } from './services/deleteSociete.service';
import { GetSocieteTerritoriesService } from './services/getSocieteTerritories.service';

// Controllers
import { GetSocietesController } from './controller/getSocietes.controller';
import { GetSocieteByIdController } from './controller/getSocieteById.controller';
import { GetSocieteByRegistrationNumberController } from './controller/getSocieteByRegistrationNumber.controller';
import { CreateSocieteController } from './controller/createSociete.controller';
import { UpdateSocieteController } from './controller/updateSociete.controller';
import { DeleteSocieteController } from './controller/deleteSociete.controller';
import { GetSocieteTerritoriesController } from './controller/getSocieteTerritories.controller';

// Routes
import { SocieteRoutes } from './routes/societe.route';

export const initSocieteModule = (db: PostgresDatabase): Router => {
  // 1. Initialiser le Repository
  const societeRepository = new SocieteRepository(db, logger);

  // 2. Initialiser les Services Métiers
  const getSocietesService = new GetSocietesService(societeRepository, logger);
  const getSocieteByIdService = new GetSocieteByIdService(societeRepository, logger);
  const getSocieteByRegistrationNumberService = new GetSocieteByRegistrationNumberService(societeRepository, logger);
  const createSocieteService = new CreateSocieteService(societeRepository, logger);
  const updateSocieteService = new UpdateSocieteService(societeRepository, logger);
  const deleteSocieteService = new DeleteSocieteService(societeRepository, logger);
  const getSocieteTerritoriesService = new GetSocieteTerritoriesService(societeRepository, logger);

  // 3. Initialiser les Contrôleurs
  const getSocietesController = new GetSocietesController(getSocietesService);
  const getSocieteByIdController = new GetSocieteByIdController(getSocieteByIdService);
  const getSocieteByRegistrationNumberController = new GetSocieteByRegistrationNumberController(getSocieteByRegistrationNumberService);
  const createSocieteController = new CreateSocieteController(createSocieteService);
  const updateSocieteController = new UpdateSocieteController(updateSocieteService);
  const deleteSocieteController = new DeleteSocieteController(deleteSocieteService);
  const getSocieteTerritoriesController = new GetSocieteTerritoriesController(getSocieteTerritoriesService);

  // 4. Lier les Contrôleurs aux Routes
  const societeRoutes = new SocieteRoutes(
    getSocietesController,
    getSocieteByIdController,
    getSocieteByRegistrationNumberController,
    createSocieteController,
    updateSocieteController,
    deleteSocieteController,
    getSocieteTerritoriesController,
  );

  return societeRoutes.router;
};