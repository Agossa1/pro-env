import { Router } from 'express';
import PostgresDatabase from '../../config/database/postgres';
import { logger } from '../../config/loggers/logger';

// Repositories
import { MissionRepository } from './repositories/mission.repositories';

// Services
import { GetMissionsService } from './services/getMissions.service';
import { GetMissionByIdService } from './services/getMissionById.service';
import { CreateMissionService } from './services/createMission.service';
import { UpdateMissionService } from './services/updateMission.service';
import { DeleteMissionService } from './services/deleteMission.service';
import { GetMissionChecklistService } from './services/getMissionChecklist.service';
import { AddChecklistItemService } from './services/addChecklistItem.service';
import { AssignUserToMissionService } from './services/assignUserToMission.service';
import { GetMissionStatusHistoryService } from './services/getMissionStatusHistory.service';

// Controllers
import { GetMissionsController } from './controller/getMissions.controller';
import { GetMissionByIdController } from './controller/getMissionById.controller';
import { CreateMissionController } from './controller/createMission.controller';
import { UpdateMissionController } from './controller/updateMission.controller';
import { DeleteMissionController } from './controller/deleteMission.controller';
import { GetMissionChecklistController } from './controller/getMissionChecklist.controller';
import { AddChecklistItemController } from './controller/addChecklistItem.controller';
import { AssignUserToMissionController } from './controller/assignUserToMission.controller';
import { GetMissionStatusHistoryController } from './controller/getMissionStatusHistory.controller';

// Routes
import { MissionRoutes } from './routes/mission.route';

export const initMissionModule = (db: PostgresDatabase): Router => {
  // 1. Initialiser le Repository
  const missionRepository = new MissionRepository(db, logger);

  // 2. Initialiser les Services Métiers
  const getMissionsService = new GetMissionsService(missionRepository, logger);
  const getMissionByIdService = new GetMissionByIdService(missionRepository, logger);
  const createMissionService = new CreateMissionService(missionRepository, logger);
  const updateMissionService = new UpdateMissionService(missionRepository, logger);
  const deleteMissionService = new DeleteMissionService(missionRepository, logger);
  const getMissionChecklistService = new GetMissionChecklistService(missionRepository, logger);
  const addChecklistItemService = new AddChecklistItemService(missionRepository, logger);
  const assignUserToMissionService = new AssignUserToMissionService(missionRepository, logger);
  const getMissionStatusHistoryService = new GetMissionStatusHistoryService(missionRepository, logger);

  // 3. Initialiser les Contrôleurs
  const getMissionsController = new GetMissionsController(getMissionsService);
  const getMissionByIdController = new GetMissionByIdController(getMissionByIdService);
  const createMissionController = new CreateMissionController(createMissionService);
  const updateMissionController = new UpdateMissionController(updateMissionService);
  const deleteMissionController = new DeleteMissionController(deleteMissionService);
  const getMissionChecklistController = new GetMissionChecklistController(getMissionChecklistService);
  const addChecklistItemController = new AddChecklistItemController(addChecklistItemService);
  const assignUserToMissionController = new AssignUserToMissionController(assignUserToMissionService);
  const getMissionStatusHistoryController = new GetMissionStatusHistoryController(getMissionStatusHistoryService);

  // 4. Lier les Contrôleurs aux Routes
  const missionRoutes = new MissionRoutes(
    getMissionsController,
    getMissionByIdController,
    createMissionController,
    updateMissionController,
    deleteMissionController,
    getMissionChecklistController,
    addChecklistItemController,
    assignUserToMissionController,
    getMissionStatusHistoryController,
  );

  return missionRoutes.router;
};