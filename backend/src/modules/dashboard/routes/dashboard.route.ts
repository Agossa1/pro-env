import { Router } from 'express';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';

// Controllers
import { GetKpisController } from '../controllers/getKpis.controller';
import { GetActivityChartController } from '../controllers/getActivityChart.controller';
import { GetReportsByCategoryController } from '../controllers/getReportsByCategory.controller';
import { GetReportsByStatusController } from '../controllers/getReportsByStatus.controller';
import { GetPriorityMissionsController } from '../controllers/getPriorityMissions.controller';
import { GetRecentInterventionsController } from '../controllers/getRecentInterventions.controller';
import { GetRecentReportsController } from '../controllers/getRecentReports.controller';

export class DashboardRoutes {
  public router: Router;

  constructor(
    private readonly getKpisController: GetKpisController,
    private readonly getActivityChartController: GetActivityChartController,
    private readonly getReportsByCategoryController: GetReportsByCategoryController,
    private readonly getReportsByStatusController: GetReportsByStatusController,
    private readonly getPriorityMissionsController: GetPriorityMissionsController,
    private readonly getRecentInterventionsController: GetRecentInterventionsController,
    private readonly getRecentReportsController: GetRecentReportsController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // Toutes les routes dashboard nécessitent une authentification
    this.router.use(authMiddleware);

    this.router.get('/kpis', this.getKpisController.getKpis);
    this.router.get('/activity-chart', this.getActivityChartController.getActivityChart);
    this.router.get('/reports-by-category', this.getReportsByCategoryController.getReportsByCategory);
    this.router.get('/reports-by-status', this.getReportsByStatusController.getReportsByStatus);
    this.router.get('/priority-missions', this.getPriorityMissionsController.getPriorityMissions);
    this.router.get('/recent-interventions', this.getRecentInterventionsController.getRecentInterventions);
    this.router.get('/recent-reports', this.getRecentReportsController.getRecentReports);
  }
}