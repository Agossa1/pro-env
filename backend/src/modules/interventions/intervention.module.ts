import { Router } from 'express';
import PostgresDatabase from '../../config/database/postgres';
import { logger } from '../../config/loggers/logger';

// Repositories
import { InterventionRepository } from './repositories/intervention.repositories';

// Services
import { GetInterventionsService } from './services/getInterventions.service';
import { GetInterventionByIdService } from './services/getInterventionById.service';
import { CreateInterventionService } from './services/createIntervention.service';
import { UpdateInterventionService } from './services/updateIntervention.service';
import { DeleteInterventionService } from './services/deleteIntervention.service';
import { CreateFieldReportService } from './services/createFieldReport.service';
import { GetInterventionReportsService } from './services/getInterventionReports.service';

// Controllers
import { GetInterventionsController } from './controller/getInterventions.controller';
import { GetInterventionByIdController } from './controller/getInterventionById.controller';
import { CreateInterventionController } from './controller/createIntervention.controller';
import { UpdateInterventionController } from './controller/updateIntervention.controller';
import { DeleteInterventionController } from './controller/deleteIntervention.controller';
import { CreateFieldReportController } from './controller/createFieldReport.controller';
import { GetInterventionReportsController } from './controller/getInterventionReports.controller';

// Routes
import { InterventionRoutes } from './routes/intervention.route';

export const initInterventionModule = (db: PostgresDatabase): Router => {
  // 1. Initialiser le Repository
  const interventionRepository = new InterventionRepository(db, logger);

  // 2. Initialiser les Services Métiers
  const getInterventionsService = new GetInterventionsService(interventionRepository, logger);
  const getInterventionByIdService = new GetInterventionByIdService(interventionRepository, logger);
  const createInterventionService = new CreateInterventionService(interventionRepository, logger);
  const updateInterventionService = new UpdateInterventionService(interventionRepository, logger);
  const deleteInterventionService = new DeleteInterventionService(interventionRepository, logger);
  const createFieldReportService = new CreateFieldReportService(interventionRepository, logger);
  const getInterventionReportsService = new GetInterventionReportsService(interventionRepository, logger);

  // 3. Initialiser les Contrôleurs
  const getInterventionsController = new GetInterventionsController(getInterventionsService);
  const getInterventionByIdController = new GetInterventionByIdController(getInterventionByIdService);
  const createInterventionController = new CreateInterventionController(createInterventionService);
  const updateInterventionController = new UpdateInterventionController(updateInterventionService);
  const deleteInterventionController = new DeleteInterventionController(deleteInterventionService);
  const createFieldReportController = new CreateFieldReportController(createFieldReportService);
  const getInterventionReportsController = new GetInterventionReportsController(getInterventionReportsService);

  // 4. Lier les Contrôleurs aux Routes
  const interventionRoutes = new InterventionRoutes(
    getInterventionsController,
    getInterventionByIdController,
    createInterventionController,
    updateInterventionController,
    deleteInterventionController,
    createFieldReportController,
    getInterventionReportsController,
  );

  return interventionRoutes.router;
};