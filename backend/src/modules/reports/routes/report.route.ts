import { Router } from 'express';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';

// Controllers
import { GetReportsController } from '../controller/getReports.controller';
import { GetReportByIdController } from '../controller/getReportById.controller';
import { CreateReportController } from '../controller/createReport.controller';
import { UpdateReportController } from '../controller/updateReport.controller';
import { DeleteReportController } from '../controller/deleteReport.controller';
import { GetReportDetailsController } from '../controller/getReportDetails.controller';
import { GetReportStatusHistoryController } from '../controller/getReportStatusHistory.controller';

export class ReportRoutes {
  public router: Router;

  constructor(
    private readonly getReportsController: GetReportsController,
    private readonly getReportByIdController: GetReportByIdController,
    private readonly createReportController: CreateReportController,
    private readonly updateReportController: UpdateReportController,
    private readonly deleteReportController: DeleteReportController,
    private readonly getReportDetailsController: GetReportDetailsController,
    private readonly getReportStatusHistoryController: GetReportStatusHistoryController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // ── Routes protégées par authentification ──────────────────────────────
    this.router.use(authMiddleware);

    // GET /api/reports — liste paginée (filtres ?territoryId=&status=&issueCategory=)
    this.router.get('/', this.getReportsController.getReports);

    // GET /api/reports/:id/status-history — historique des statuts
    // (déclaré avant /:id pour éviter le conflit)
    this.router.get('/:id/status-history', this.getReportStatusHistoryController.getReportStatusHistory);

    // GET /api/reports/:id/details — détails 1:1 selon la catégorie
    this.router.get('/:id/details', this.getReportDetailsController.getReportDetails);

    // GET /api/reports/:id — détail du rapport
    this.router.get('/:id', this.getReportByIdController.getReportById);

    // POST /api/reports — création
    this.router.post('/', this.createReportController.createReport);

    // PUT /api/reports/:id — mise à jour
    this.router.put('/:id', this.updateReportController.updateReport);

    // DELETE /api/reports/:id — suppression logique
    this.router.delete('/:id', this.deleteReportController.deleteReport);
  }
}