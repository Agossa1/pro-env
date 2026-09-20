"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appErrors_1 = require("../../../shared/errors/appErrors");
const report_repositories_1 = require("../repositories/report.repositories");
const report_enums_1 = require("../types/report.enums");
// Mock dependencies
const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
};
jest.mock('../repositories/report.repositories');
// Services
const getReports_service_1 = require("../services/getReports.service");
const getReportById_service_1 = require("../services/getReportById.service");
const createReport_service_1 = require("../services/createReport.service");
const updateReport_service_1 = require("../services/updateReport.service");
const deleteReport_service_1 = require("../services/deleteReport.service");
const getReportDetails_service_1 = require("../services/getReportDetails.service");
const getReportStatusHistory_service_1 = require("../services/getReportStatusHistory.service");
describe('Report Services', () => {
    let reportRepository;
    beforeEach(() => {
        reportRepository = new report_repositories_1.ReportRepository({}, mockLogger);
        jest.clearAllMocks();
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET REPORTS
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetReportsService', () => {
        let service;
        beforeEach(() => {
            service = new getReports_service_1.GetReportsService(reportRepository, mockLogger);
        });
        it('doit retourner une liste paginée', async () => {
            const mockResult = {
                data: [{ id: '1', title: 'Caniveau bouché', issueCategory: 'drainage' }],
                total: 1, page: 1, limit: 50, totalPages: 1,
            };
            reportRepository.getAllReports.mockResolvedValueOnce(mockResult);
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
        let service;
        beforeEach(() => {
            service = new getReportById_service_1.GetReportByIdService(reportRepository, mockLogger);
        });
        it('doit retourner le rapport si trouvé', async () => {
            const mockReport = { id: '1', title: 'Caniveau bouché', issueCategory: 'drainage' };
            reportRepository.getReportById.mockResolvedValueOnce(mockReport);
            const result = await service.getReportById('1');
            expect(result).toEqual(mockReport);
        });
        it('doit lever NotFoundError si inexistant', async () => {
            reportRepository.getReportById.mockResolvedValueOnce(null);
            await expect(service.getReportById('uuid-inexistant')).rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // CREATE REPORT
    // ─────────────────────────────────────────────────────────────────────────
    describe('CreateReportService', () => {
        let service;
        beforeEach(() => {
            service = new createReport_service_1.CreateReportService(reportRepository, mockLogger);
        });
        it('doit lever BadRequestError si champs requis absents', async () => {
            await expect(service.createReport({ municipalityId: '', title: '', issueCategory: '' }))
                .rejects.toThrow(appErrors_1.BadRequestError);
        });
        it('doit créer le rapport avec le créateur injecté', async () => {
            const payload = { municipalityId: 'terr-1', title: 'Caniveau bouché', issueCategory: 'drainage' };
            const mockCreated = { id: 'new-uuid', title: 'Caniveau bouché' };
            reportRepository.createReport.mockResolvedValueOnce(mockCreated);
            const result = await service.createReport(payload, { userId: 'user-1' });
            expect(reportRepository.createReport).toHaveBeenCalledWith(expect.objectContaining({ createdBy: 'user-1' }));
            expect(result).toEqual(mockCreated);
            expect(mockLogger.info).toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE REPORT
    // ─────────────────────────────────────────────────────────────────────────
    describe('UpdateReportService', () => {
        let service;
        beforeEach(() => {
            service = new updateReport_service_1.UpdateReportService(reportRepository, mockLogger);
        });
        it('doit mettre à jour le rapport', async () => {
            const mockUpdated = { id: '1', title: 'Nouveau titre', issueCategory: 'drainage' };
            reportRepository.updateReport.mockResolvedValueOnce(mockUpdated);
            const result = await service.updateReport('1', { title: 'Nouveau titre' });
            expect(result).toEqual(mockUpdated);
        });
        it('doit lever NotFoundError si inexistant', async () => {
            reportRepository.updateReport.mockResolvedValueOnce(null);
            await expect(service.updateReport('uuid-inexistant', { title: 'X' }))
                .rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // DELETE REPORT
    // ─────────────────────────────────────────────────────────────────────────
    describe('DeleteReportService', () => {
        let service;
        beforeEach(() => {
            service = new deleteReport_service_1.DeleteReportService(reportRepository, mockLogger);
        });
        it('doit supprimer le rapport', async () => {
            reportRepository.deleteReport.mockResolvedValueOnce(undefined);
            await service.deleteReport('1');
            expect(reportRepository.deleteReport).toHaveBeenCalledWith('1');
            expect(mockLogger.info).toHaveBeenCalled();
        });
        it('doit propager NotFoundError', async () => {
            const error = new appErrors_1.NotFoundError('Rapport introuvable');
            reportRepository.deleteReport.mockRejectedValueOnce(error);
            await expect(service.deleteReport('1')).rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET REPORT DETAILS
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetReportDetailsService', () => {
        let service;
        beforeEach(() => {
            service = new getReportDetails_service_1.GetReportDetailsService(reportRepository, mockLogger);
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
        let service;
        beforeEach(() => {
            service = new getReportStatusHistory_service_1.GetReportStatusHistoryService(reportRepository, mockLogger);
        });
        it('doit retourner l\'historique des statuts', async () => {
            const mockHistory = [{ id: 'h1', reportId: '1', oldStatus: null, newStatus: report_enums_1.ReportStatus.SUBMITTED, changedBy: null, createdAt: new Date() }];
            reportRepository.getReportStatusHistory.mockResolvedValueOnce(mockHistory);
            const result = await service.getReportStatusHistory('1');
            expect(result).toEqual(mockHistory);
            expect(mockLogger.info).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=reports.services.spec.js.map