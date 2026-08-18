import { Router } from 'express';
import PostgresDatabase from '../../config/database/postgres';
import { logger } from '../../config/loggers/logger';

// Repository
import { DashboardRepository } from './repositories/dashboard.repositories';

// Services
import { GetKpisService } from './services/getKpis.service';
import { GetActivityChartService } from './services/getActivityChart.service';
import { GetReportsByCategoryService } from './services/getReportsByCategory.service';
import { GetReportsByStatusService } from './services/getReportsByStatus.service';
import { GetPriorityMissionsService } from './services/getPriorityMissions.service';
import { GetRecentInterventionsService } from './services/getRecentInterventions.service';
import { GetRecentReportsService } from './services/getRecentReports.service';

// Controllers
import { GetKpisController } from './controllers/getKpis.controller';
import { GetActivityChartController } from './controllers/getActivityChart.controller';
import { GetReportsByCategoryController } from './controllers/getReportsByCategory.controller';
import { GetReportsByStatusController } from './controllers/getReportsByStatus.controller';
import { GetPriorityMissionsController } from './controllers/getPriorityMissions.controller';
import { GetRecentInterventionsController } from './controllers/getRecentInterventions.controller';
import { GetRecentReportsController } from './controllers/getRecentReports.controller';

// Routes
import { DashboardRoutes } from './routes/dashboard.route';

export const initDashboardModule = (db: PostgresDatabase): Router => {
  // 1. Initialiser le Repository
  const dashboardRepository = new DashboardRepository(db, logger);

  // 2. Initialiser les Services Métiers
  const getKpisService = new GetKpisService(dashboardRepository, logger);
  const getActivityChartService = new GetActivityChartService(dashboardRepository, logger);
  const getReportsByCategoryService = new GetReportsByCategoryService(dashboardRepository, logger);
  const getReportsByStatusService = new GetReportsByStatusService(dashboardRepository, logger);
  const getPriorityMissionsService = new GetPriorityMissionsService(dashboardRepository, logger);
  const getRecentInterventionsService = new GetRecentInterventionsService(dashboardRepository, logger);
  const getRecentReportsService = new GetRecentReportsService(dashboardRepository, logger);

  // 3. Initialiser les Contrôleurs
  const getKpisController = new GetKpisController(getKpisService);
  const getActivityChartController = new GetActivityChartController(getActivityChartService);
  const getReportsByCategoryController = new GetReportsByCategoryController(getReportsByCategoryService);
  const getReportsByStatusController = new GetReportsByStatusController(getReportsByStatusService);
  const getPriorityMissionsController = new GetPriorityMissionsController(getPriorityMissionsService);
  const getRecentInterventionsController = new GetRecentInterventionsController(getRecentInterventionsService);
  const getRecentReportsController = new GetRecentReportsController(getRecentReportsService);

  // 4. Lier les Contrôleurs aux Routes
  const dashboardRoutes = new DashboardRoutes(
    getKpisController,
    getActivityChartController,
    getReportsByCategoryController,
    getReportsByStatusController,
    getPriorityMissionsController,
    getRecentInterventionsController,
    getRecentReportsController,
  );

  return dashboardRoutes.router;
};