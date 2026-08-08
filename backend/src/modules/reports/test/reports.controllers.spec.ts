import type { Request, Response, NextFunction } from 'express';

// Mock des services
jest.mock('../services/getReports.service');
jest.mock('../services/getReportById.service');
jest.mock('../services/createReport.service');
jest.mock('../services/updateReport.service');
jest.mock('../services/deleteReport.service');
jest.mock('../services/getReportDetails.service');
jest.mock('../services/getReportStatusHistory.service');

// Imports après les mocks
import { GetReportsController } from '../controller/getReports.controller';
import { GetReportByIdController } from '../controller/getReportById.controller';
import { CreateReportController } from '../controller/createReport.controller';
import { UpdateReportController } from '../controller/updateReport.controller';
import { DeleteReportController } from '../controller/deleteReport.controller';
import { GetReportDetailsController } from '../controller/getReportDetails.controller';
import { GetReportStatusHistoryController } from '../controller/getReportStatusHistory.controller';

import { GetReportsService } from '../services/getReports.service';
import { ReportStatus } from '../types/report.enums';
import { GetReportByIdService } from '../services/getReportById.service';
import { CreateReportService } from '../services/createReport.service';
import { UpdateReportService } from '../services/updateReport.service';
import { DeleteReportService } from '../services/deleteReport.service';
import { GetReportDetailsService } from '../services/getReportDetails.service';
import { GetReportStatusHistoryService } from '../services/getReportStatusHistory.service';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

describe('Report Controllers', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET REPORTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetReportsController', () => {
    let controller: GetReportsController;
    let service: jest.Mocked<GetReportsService>;

    beforeEach(() => {
      service = new GetReportsService({} as any, {} as any) as jest.Mocked<GetReportsService>;
      controller = new GetReportsController(service);
    });

    it('doit retourner 200 avec pagination', async () => {
      const mockResult = {
        data: [{ id: '1', title: 'Caniveau bouché', issueCategory: 'drainage' }],
        total: 1, page: 1, limit: 50, totalPages: 1,
      };
      service.getReports.mockResolvedValueOnce(mockResult as any);

      await controller.getReports(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        pagination: { total: 1, page: 1, limit: 50, totalPages: 1 },
      }));
    });

    it('doit passer l\'erreur à next() si le service échoue', async () => {
      const error = new Error('Service error');
      service.getReports.mockRejectedValueOnce(error);

      await controller.getReports(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET REPORT BY ID
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetReportByIdController', () => {
    let controller: GetReportByIdController;
    let service: jest.Mocked<GetReportByIdService>;

    beforeEach(() => {
      service = new GetReportByIdService({} as any, {} as any) as jest.Mocked<GetReportByIdService>;
      controller = new GetReportByIdController(service);
    });

    it('doit retourner 200 avec le rapport', async () => {
      mockReq.params = { id: VALID_UUID };
      const mockReport = { id: VALID_UUID, title: 'Caniveau bouché', issueCategory: 'drainage' };
      service.getReportById.mockResolvedValueOnce(mockReport as any);

      await controller.getReportById(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getReportById).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockReport }));
    });

    it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
      mockReq.params = { id: 'uuid-invalide' };

      await controller.getReportById(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.getReportById).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE REPORT
  // ─────────────────────────────────────────────────────────────────────────

  describe('CreateReportController', () => {
    let controller: CreateReportController;
    let service: jest.Mocked<CreateReportService>;

    beforeEach(() => {
      service = new CreateReportService({} as any, {} as any) as jest.Mocked<CreateReportService>;
      controller = new CreateReportController(service);
    });

    it('doit retourner 400 si validation Zod échoue', async () => {
      mockReq.body = { territoryId: 'uuid-invalide', title: '', issueCategory: 'invalide' };

      await controller.createReport(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.createReport).not.toHaveBeenCalled();
    });

    it('doit retourner 201 en cas de succès avec le créateur', async () => {
      mockReq.body = { territoryId: VALID_UUID, title: 'Caniveau bouché', issueCategory: 'drainage' };
      (mockReq as any).user = { userId: 'user-1' };
      const mockCreated = { id: 'new-uuid', title: 'Caniveau bouché', issueCategory: 'drainage' };
      service.createReport.mockResolvedValueOnce(mockCreated as any);

      await controller.createReport(mockReq as Request, mockRes as Response, mockNext);

      expect(service.createReport).toHaveBeenCalledWith(
        mockReq.body,
        expect.objectContaining({ userId: 'user-1' })
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockCreated }));
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE REPORT
  // ─────────────────────────────────────────────────────────────────────────

  describe('UpdateReportController', () => {
    let controller: UpdateReportController;
    let service: jest.Mocked<UpdateReportService>;

    beforeEach(() => {
      service = new UpdateReportService({} as any, {} as any) as jest.Mocked<UpdateReportService>;
      controller = new UpdateReportController(service);
    });

    it('doit retourner 200 en cas de succès', async () => {
      mockReq.params = { id: VALID_UUID };
      mockReq.body = { title: 'Nouveau titre' };
      const mockUpdated = { id: VALID_UUID, title: 'Nouveau titre', issueCategory: 'drainage' };
      service.updateReport.mockResolvedValueOnce(mockUpdated as any);

      await controller.updateReport(mockReq as Request, mockRes as Response, mockNext);

      expect(service.updateReport).toHaveBeenCalledWith(VALID_UUID, mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('doit retourner 400 si l\'id invalide', async () => {
      mockReq.params = { id: 'uuid-invalide' };
      mockReq.body = { title: 'X' };

      await controller.updateReport(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.updateReport).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE REPORT
  // ─────────────────────────────────────────────────────────────────────────

  describe('DeleteReportController', () => {
    let controller: DeleteReportController;
    let service: jest.Mocked<DeleteReportService>;

    beforeEach(() => {
      service = new DeleteReportService({} as any, {} as any) as jest.Mocked<DeleteReportService>;
      controller = new DeleteReportController(service);
    });

    it('doit retourner 200 en cas de succès', async () => {
      mockReq.params = { id: VALID_UUID };
      service.deleteReport.mockResolvedValueOnce(undefined);

      await controller.deleteReport(mockReq as Request, mockRes as Response, mockNext);

      expect(service.deleteReport).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: null }));
    });

    it('doit retourner 400 si l\'id invalide', async () => {
      mockReq.params = { id: 'uuid-invalide' };

      await controller.deleteReport(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.deleteReport).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET REPORT DETAILS
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetReportDetailsController', () => {
    let controller: GetReportDetailsController;
    let service: jest.Mocked<GetReportDetailsService>;

    beforeEach(() => {
      service = new GetReportDetailsService({} as any, {} as any) as jest.Mocked<GetReportDetailsService>;
      controller = new GetReportDetailsController(service);
    });

    it('doit retourner 200 avec les détails', async () => {
      mockReq.params = { id: VALID_UUID };
      const mockDetails = { report_id: VALID_UUID, blockage_level_pct: 80 };
      service.getReportDetails.mockResolvedValueOnce(mockDetails as any);

      await controller.getReportDetails(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getReportDetails).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockDetails }));
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET REPORT STATUS HISTORY
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetReportStatusHistoryController', () => {
    let controller: GetReportStatusHistoryController;
    let service: jest.Mocked<GetReportStatusHistoryService>;

    beforeEach(() => {
      service = new GetReportStatusHistoryService({} as any, {} as any) as jest.Mocked<GetReportStatusHistoryService>;
      controller = new GetReportStatusHistoryController(service);
    });

    it('doit retourner 200 avec l\'historique', async () => {
      mockReq.params = { id: VALID_UUID };
      const mockHistory = [{ id: 'h1', reportId: VALID_UUID, oldStatus: null, newStatus: ReportStatus.SUBMITTED, changedBy: null, createdAt: new Date() }];
      service.getReportStatusHistory.mockResolvedValueOnce(mockHistory);

      await controller.getReportStatusHistory(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getReportStatusHistory).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockHistory }));
    });
  });
});