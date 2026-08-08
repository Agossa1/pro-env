import { Router } from 'express';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';

// Controllers
import { GetInterventionsController } from '../controller/getInterventions.controller';
import { GetInterventionByIdController } from '../controller/getInterventionById.controller';
import { CreateInterventionController } from '../controller/createIntervention.controller';
import { UpdateInterventionController } from '../controller/updateIntervention.controller';
import { DeleteInterventionController } from '../controller/deleteIntervention.controller';
import { CreateFieldReportController } from '../controller/createFieldReport.controller';
import { GetInterventionReportsController } from '../controller/getInterventionReports.controller';

export class InterventionRoutes {
  public router: Router;

  constructor(
    private readonly getInterventionsController: GetInterventionsController,
    private readonly getInterventionByIdController: GetInterventionByIdController,
    private readonly createInterventionController: CreateInterventionController,
    private readonly updateInterventionController: UpdateInterventionController,
    private readonly deleteInterventionController: DeleteInterventionController,
    private readonly createFieldReportController: CreateFieldReportController,
    private readonly getInterventionReportsController: GetInterventionReportsController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // ── Routes protégées par authentification ──────────────────────────────
    this.router.use(authMiddleware);

    // GET /api/interventions — liste paginée (filtres ?missionId=&teamId=&status=)
    this.router.get('/', this.getInterventionsController.getInterventions);

    // GET /api/interventions/:id/reports — rapports terrain d'une intervention
    this.router.get('/:id/reports', this.getInterventionReportsController.getInterventionReports);

    // POST /api/interventions/:id/reports — créer un rapport terrain
    this.router.post('/:id/reports', this.createFieldReportController.createFieldReport);

    // GET /api/interventions/:id — détail d'une intervention
    this.router.get('/:id', this.getInterventionByIdController.getInterventionById);

    // POST /api/interventions — création
    this.router.post('/', this.createInterventionController.createIntervention);

    // PUT /api/interventions/:id — mise à jour (statut, notes, dates)
    this.router.put('/:id', this.updateInterventionController.updateIntervention);

    // DELETE /api/interventions/:id — suppression logique
    this.router.delete('/:id', this.deleteInterventionController.deleteIntervention);
  }
}