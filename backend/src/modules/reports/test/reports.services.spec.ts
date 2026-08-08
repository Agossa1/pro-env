import { Logger } from 'winston';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';
import { ReportRepository } from '../repositories/report.repositories';
import { ReportStatus } from '../types/report.enums';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

jest.mock('../repositories/report.repositories');

// Services
import { GetReportsService } from '../services/getReports.service';
import { GetReportByIdService } from '../services/getReportById.service';
import { CreateReportService } from '../services/createReport.service';
import { UpdateReportService } from '../services/updateReport.service';
import { DeleteReportService } from '../services/deleteReport.service';
import { GetReportDetailsService } from '../services/getReportDetails.service';
import { GetReportStatusHistoryService } from '../services/getReportStatusHistory.service';

describe('Report Services', () => {
  let reportRepository: jest.Mocked<ReportRepository>;

  beforeEach(() => {
    reportRepository = new ReportRepository({} as any, mockLogger) as jest.Mocked<ReportRepository>;
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET REPORTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetReportsService', () => {
    let service: GetReportsService;

    beforeEach(() => {
      service = new GetReportsService(reportRepository, mockLogger);
    });

    it('doit retourner une liste paginée', async () => {
      const mockResult = {
        data: [{ id: '1', title: 'Caniveau bouché', issueCategory: 'drainage' }],
        total: 1, page: 1, limit: 50, totalPages: 1,
      };
      reportRepository.getAllReports.mockResolvedValueOnce(mockResult as any);

      const result = await service.getReports({ page: 1, limit: 50 });

      expect(result).toEqual(mockResult);
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('doit logger et propager l\'erreur', async () => {
      const error = new Error('DB error');
      reportRepository.getAllReports.mockRejectedValueOnce(error);

      await expect(service.getReports()).rejects.toThrow('DB error');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET REPORT BY ID
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetReportByIdService', () => {
    let service: GetReportByIdService;

    beforeEach(() => {
      service = new GetReportByIdService(reportRepository, mockLogger);
    });

    it('doit retourner le rapport si trouvé', async () => {
      const mockReport = { id: '1', title: 'Caniveau bouché', issueCategory: 'drainage' };
      reportRepository.getReportById.mockResolvedValueOnce(mockReport as any);

      const result = await service.getReportById('1');

      expect(result).toEqual(mockReport);
    });

    it('doit lever NotFoundError si inexistant', async () => {
      reportRepository.getReportById.mockResolvedValueOnce(null);

      await expect(service.getReportById('uuid-inexistant')).rejects.toThrow(NotFoundError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE REPORT
  // ─────────────────────────────────────────────────────────────────────────

  describe('CreateReportService', () => {
    let service: CreateReportService;

    beforeEach(() => {
      service = new CreateReportService(reportRepository, mockLogger);
    });

    it('doit lever BadRequestError si champs requis absents', async () => {
      await expect(service.createReport({ territoryId: '', title: '', issueCategory: '' as any }))
        .rejects.toThrow(BadRequestError);
    });

    it('doit créer le rapport avec le créateur injecté', async () => {
      const payload = { territoryId: 'terr-1', title: 'Caniveau bouché', issueCategory: 'drainage' as any };
      const mockCreated = { id: 'new-uuid', title: 'Caniveau bouché' };
      reportRepository.createReport.mockResolvedValueOnce(mockCreated as any);

      const result = await service.createReport(payload, { userId: 'user-1' });

      expect(reportRepository.createReport).toHaveBeenCalledWith(
        expect.objectContaining({ createdBy: 'user-1' })
      );
      expect(result).toEqual(mockCreated);
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE REPORT
  // ─────────────────────────────────────────────────────────────────────────

  describe('UpdateReportService', () => {
    let service: UpdateReportService;

    beforeEach(() => {
      service = new UpdateReportService(reportRepository, mockLogger);
    });

    it('doit mettre à jour le rapport', async () => {
      const mockUpdated = { id: '1', title: 'Nouveau titre', issueCategory: 'drainage' };
      reportRepository.updateReport.mockResolvedValueOnce(mockUpdated as any);

      const result = await service.updateReport('1', { title: 'Nouveau titre' });

      expect(result).toEqual(mockUpdated);
    });

    it('doit lever NotFoundError si inexistant', async () => {
      reportRepository.updateReport.mockResolvedValueOnce(null);

      await expect(service.updateReport('uuid-inexistant', { title: 'X' }))
        .rejects.toThrow(NotFoundError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE REPORT
  // ─────────────────────────────────────────────────────────────────────────

  describe('DeleteReportService', () => {
    let service: DeleteReportService;

    beforeEach(() => {
      service = new DeleteReportService(reportRepository, mockLogger);
    });

    it('doit supprimer le rapport', async () => {
      reportRepository.deleteReport.mockResolvedValueOnce(undefined);

      await service.deleteReport('1');

      expect(reportRepository.deleteReport).toHaveBeenCalledWith('1');
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('doit propager NotFoundError', async () => {
      const error = new NotFoundError('Rapport introuvable');
      reportRepository.deleteReport.mockRejectedValueOnce(error);

      await expect(service.deleteReport('1')).rejects.toThrow(NotFoundError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET REPORT DETAILS
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetReportDetailsService', () => {
    let service: GetReportDetailsService;

    beforeEach(() => {
      service = new GetReportDetailsService(reportRepository, mockLogger);
    });

    it('doit retourner les détails du rapport', async () => {
      const mockDetails = { report_id: '1', blockage_level_pct: 80 };
      reportRepository.getReportDetails.mockResolvedValueOnce(mockDetails);

      const result = await service.getReportDetails('1');

      expect(result).toEqual(mockDetails);
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET REPORT STATUS HISTORY
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetReportStatusHistoryService', () => {
    let service: GetReportStatusHistoryService;

    beforeEach(() => {
      service = new GetReportStatusHistoryService(reportRepository, mockLogger);
    });

    it('doit retourner l\'historique des statuts', async () => {
      const mockHistory = [{ id: 'h1', reportId: '1', oldStatus: null, newStatus: ReportStatus.SUBMITTED, changedBy: null, createdAt: new Date() }];
      reportRepository.getReportStatusHistory.mockResolvedValueOnce(mockHistory);

      const result = await service.getReportStatusHistory('1');

      expect(result).toEqual(mockHistory);
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });
});