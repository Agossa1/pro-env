"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../../shared/middlewares/auth.middleware");
class MissionRoutes {
    constructor(getMissionsController, getMissionByIdController, createMissionController, updateMissionController, deleteMissionController, getMissionChecklistController, addChecklistItemController, assignUserToMissionController, getMissionStatusHistoryController) {
        this.getMissionsController = getMissionsController;
        this.getMissionByIdController = getMissionByIdController;
        this.createMissionController = createMissionController;
        this.updateMissionController = updateMissionController;
        this.deleteMissionController = deleteMissionController;
        this.getMissionChecklistController = getMissionChecklistController;
        this.addChecklistItemController = addChecklistItemController;
        this.assignUserToMissionController = assignUserToMissionController;
        this.getMissionStatusHistoryController = getMissionStatusHistoryController;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // ── Routes protégées par authentification ──────────────────────────────
        this.router.use(auth_middleware_1.authMiddleware);
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
exports.MissionRoutes = MissionRoutes;
//# sourceMappingURL=mission.route.js.map