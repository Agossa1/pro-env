import { Router } from 'express';
import PostgresDatabase from '../../config/database/postgres';
import { logger } from '../../config/loggers/logger';

// Repositories
import { ReportRepository } from './repositories/report.repositories';

// Services
import { GetReportsService } from './services/getReports.service';
import { GetReportByIdService } from './services/getReportById.service';
import { CreateReportService } from './services/createReport.service';
import { UpdateReportService } from './services/updateReport.service';
import { DeleteReportService } from './services/deleteReport.service';
import { GetReportDetailsService } from './services/getReportDetails.service';
import { GetReportStatusHistoryService } from './services/getReportStatusHistory.service';

// Controllers
import { GetReportsController } from './controller/getReports.controller';
import { GetReportByIdController } from './controller/getReportById.controller';
import { CreateReportController } from './controller/createReport.controller';
import { UpdateReportController } from './controller/updateReport.controller';
import { DeleteReportController } from './controller/deleteReport.controller';
import { GetReportDetailsController } from './controller/getReportDetails.controller';
import { GetReportStatusHistoryController } from './controller/getReportStatusHistory.controller';

// Routes
import { ReportRoutes } from './routes/report.route';

export const initReportModule = (db: PostgresDatabase): Router => {
  // 1. Initialiser le Repository
  const reportRepository = new ReportRepository(db, logger);

  // 2. Initialiser les Services Métiers
  const getReportsService = new GetReportsService(reportRepository, logger);
  const getReportByIdService = new GetReportByIdService(reportRepository, logger);
  const createReportService = new CreateReportService(reportRepository, logger);
  const updateReportService = new UpdateReportService(reportRepository, logger);
  const deleteReportService = new DeleteReportService(reportRepository, logger);
  const getReportDetailsService = new GetReportDetailsService(reportRepository, logger);
  const getReportStatusHistoryService = new GetReportStatusHistoryService(reportRepository, logger);

  // 3. Initialiser les Contrôleurs
  const getReportsController = new GetReportsController(getReportsService);
  const getReportByIdController = new GetReportByIdController(getReportByIdService);
  const createReportController = new CreateReportController(createReportService);
  const updateReportController = new UpdateReportController(updateReportService);
  const deleteReportController = new DeleteReportController(deleteReportService);
  const getReportDetailsController = new GetReportDetailsController(getReportDetailsService);
  const getReportStatusHistoryController = new GetReportStatusHistoryController(getReportStatusHistoryService);

  // 4. Lier les Contrôleurs aux Routes
  const reportRoutes = new ReportRoutes(
    getReportsController,
    getReportByIdController,
    createReportController,
    updateReportController,
    deleteReportController,
    getReportDetailsController,
    getReportStatusHistoryController,
  );

  return reportRoutes.router;
};