import { Router } from 'express';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';

// Controllers
import { GetMissionsController } from '../controller/getMissions.controller';
import { GetMissionByIdController } from '../controller/getMissionById.controller';
import { CreateMissionController } from '../controller/createMission.controller';
import { UpdateMissionController } from '../controller/updateMission.controller';
import { DeleteMissionController } from '../controller/deleteMission.controller';
import { GetMissionChecklistController } from '../controller/getMissionChecklist.controller';
import { AddChecklistItemController } from '../controller/addChecklistItem.controller';
import { AssignUserToMissionController } from '../controller/assignUserToMission.controller';
import { GetMissionStatusHistoryController } from '../controller/getMissionStatusHistory.controller';

export class MissionRoutes {
  public router: Router;

  constructor(
    private readonly getMissionsController: GetMissionsController,
    private readonly getMissionByIdController: GetMissionByIdController,
    private readonly createMissionController: CreateMissionController,
    private readonly updateMissionController: UpdateMissionController,
    private readonly deleteMissionController: DeleteMissionController,
    private readonly getMissionChecklistController: GetMissionChecklistController,
    private readonly addChecklistItemController: AddChecklistItemController,
    private readonly assignUserToMissionController: AssignUserToMissionController,
    private readonly getMissionStatusHistoryController: GetMissionStatusHistoryController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // ── Routes protégées par authentification ──────────────────────────────
    this.router.use(authMiddleware);

    // GET /api/missions — liste paginée (filtres)
    this.router.get('/', this.getMissionsController.getMissions);

    // GET /api/missions/:id/status-history — historique des statuts
    this.router.get('/:id/status-history', this.getMissionStatusHistoryController.getMissionStatusHistory);

    // GET /api/missions/:id/checklist — checklist
    this.router.get('/:id/checklist', this.getMissionChecklistController.getMissionChecklist);

    // POST /api/missions/:id/checklist — ajouter une tâche
    this.router.post('/:id/checklist', this.addChecklistItemController.addChecklistItem);

    // POST /api/missions/:id/assignees — assigner un utilisateur
    this.router.post('/:id/assignees', this.assignUserToMissionController.assignUserToMission);

    // GET /api/missions/:id — détail
    this.router.get('/:id', this.getMissionByIdController.getMissionById);

    // POST /api/missions — création
    this.router.post('/', this.createMissionController.createMission);

    // PUT /api/missions/:id — mise à jour
    this.router.put('/:id', this.updateMissionController.updateMission);

    // DELETE /api/missions/:id — suppression logique
    this.router.delete('/:id', this.deleteMissionController.deleteMission);
  }
}