"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Mock des services
jest.mock('../services/getReports.service');
jest.mock('../services/getReportById.service');
jest.mock('../services/createReport.service');
jest.mock('../services/updateReport.service');
jest.mock('../services/deleteReport.service');
jest.mock('../services/getReportDetails.service');
jest.mock('../services/getReportStatusHistory.service');
// Imports après les mocks
const getReports_controller_1 = require("../controller/getReports.controller");
const getReportById_controller_1 = require("../controller/getReportById.controller");
const createReport_controller_1 = require("../controller/createReport.controller");
const updateReport_controller_1 = require("../controller/updateReport.controller");
const deleteReport_controller_1 = require("../controller/deleteReport.controller");
const getReportDetails_controller_1 = require("../controller/getReportDetails.controller");
const getReportStatusHistory_controller_1 = require("../controller/getReportStatusHistory.controller");
const getReports_service_1 = require("../services/getReports.service");
const report_enums_1 = require("../types/report.enums");
const getReportById_service_1 = require("../services/getReportById.service");
const createReport_service_1 = require("../services/createReport.service");
const updateReport_service_1 = require("../services/updateReport.service");
const deleteReport_service_1 = require("../services/deleteReport.service");
const getReportDetails_service_1 = require("../services/getReportDetails.service");
const getReportStatusHistory_service_1 = require("../services/getReportStatusHistory.service");
const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';
describe('Report Controllers', () => {
    let mockReq;
    let mockRes;
    let mockNext;
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
        let controller;
        let service;
        beforeEach(() => {
            service = new getReports_service_1.GetReportsService({}, {});
            controller = new getReports_controller_1.GetReportsController(service);
        });
        it('doit retourner 200 avec pagination', async () => {
            const mockResult = {
                data: [{ id: '1', title: 'Caniveau bouché', issueCategory: 'drainage' }],
                total: 1, page: 1, limit: 50, totalPages: 1,
            };
            service.getReports.mockResolvedValueOnce(mockResult);
            await controller.getReports(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                pagination: { total: 1, page: 1, limit: 50, totalPages: 1 },
            }));
        });
        it('doit passer l\'erreur à next() si le service échoue', async () => {
            const error = new Error('Service error');
            service.getReports.mockRejectedValueOnce(error);
            await controller.getReports(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET REPORT BY ID
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetReportByIdController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getReportById_service_1.GetReportByIdService({}, {});
            controller = new getReportById_controller_1.GetReportByIdController(service);
        });
        it('doit retourner 200 avec le rapport', async () => {
            mockReq.params = { id: VALID_UUID };
            const mockReport = { id: VALID_UUID, title: 'Caniveau bouché', issueCategory: 'drainage' };
            service.getReportById.mockResolvedValueOnce(mockReport);
            await controller.getReportById(mockReq, mockRes, mockNext);
            expect(service.getReportById).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockReport }));
        });
        it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            await controller.getReportById(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.getReportById).not.toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // CREATE REPORT
    // ─────────────────────────────────────────────────────────────────────────
    describe('CreateReportController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new createReport_service_1.CreateReportService({}, {});
            controller = new createReport_controller_1.CreateReportController(service);
        });
        it('doit retourner 400 si validation Zod échoue', async () => {
            mockReq.body = { territoryId: 'uuid-invalide', title: '', issueCategory: 'invalide' };
            await controller.createReport(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.createReport).not.toHaveBeenCalled();
        });
        it('doit retourner 201 en cas de succès avec le créateur', async () => {
            mockReq.body = { territoryId: VALID_UUID, title: 'Caniveau bouché', issueCategory: 'drainage' };
            mockReq.user = { userId: 'user-1' };
            const mockCreated = { id: 'new-uuid', title: 'Caniveau bouché', issueCategory: 'drainage' };
            service.createReport.mockResolvedValueOnce(mockCreated);
            await controller.createReport(mockReq, mockRes, mockNext);
            expect(service.createReport).toHaveBeenCalledWith(mockReq.body, expect.objectContaining({ userId: 'user-1' }));
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockCreated }));
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE REPORT
    // ─────────────────────────────────────────────────────────────────────────
    describe('UpdateReportController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new updateReport_service_1.UpdateReportService({}, {});
            controller = new updateReport_controller_1.UpdateReportController(service);
        });
        it('doit retourner 200 en cas de succès', async () => {
            mockReq.params = { id: VALID_UUID };
            mockReq.body = { title: 'Nouveau titre' };
            const mockUpdated = { id: VALID_UUID, title: 'Nouveau titre', issueCategory: 'drainage' };
            service.updateReport.mockResolvedValueOnce(mockUpdated);
            await controller.updateReport(mockReq, mockRes, mockNext);
            expect(service.updateReport).toHaveBeenCalledWith(VALID_UUID, mockReq.body);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
        it('doit retourner 400 si l\'id invalide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            mockReq.body = { title: 'X' };
            await controller.updateReport(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.updateReport).not.toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // DELETE REPORT
    // ─────────────────────────────────────────────────────────────────────────
    describe('DeleteReportController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new deleteReport_service_1.DeleteReportService({}, {});
            controller = new deleteReport_controller_1.DeleteReportController(service);
        });
        it('doit retourner 200 en cas de succès', async () => {
            mockReq.params = { id: VALID_UUID };
            service.deleteReport.mockResolvedValueOnce(undefined);
            await controller.deleteReport(mockReq, mockRes, mockNext);
            expect(service.deleteReport).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: null }));
        });
        it('doit retourner 400 si l\'id invalide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            await controller.deleteReport(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.deleteReport).not.toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET REPORT DETAILS
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetReportDetailsController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getReportDetails_service_1.GetReportDetailsService({}, {});
            controller = new getReportDetails_controller_1.GetReportDetailsController(service);
        });
        it('doit retourner 200 avec les détails', async () => {
            mockReq.params = { id: VALID_UUID };
            const mockDetails = { report_id: VALID_UUID, blockage_level_pct: 80 };
            service.getReportDetails.mockResolvedValueOnce(mockDetails);
            await controller.getReportDetails(mockReq, mockRes, mockNext);
            expect(service.getReportDetails).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockDetails }));
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET REPORT STATUS HISTORY
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetReportStatusHistoryController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getReportStatusHistory_service_1.GetReportStatusHistoryService({}, {});
            controller = new getReportStatusHistory_controller_1.GetReportStatusHistoryController(service);
        });
        it('doit retourner 200 avec l\'historique', async () => {
            mockReq.params = { id: VALID_UUID };
            const mockHistory = [{ id: 'h1', reportId: VALID_UUID, oldStatus: null, newStatus: report_enums_1.ReportStatus.SUBMITTED, changedBy: null, createdAt: new Date() }];
            service.getReportStatusHistory.mockResolvedValueOnce(mockHistory);
            await controller.getReportStatusHistory(mockReq, mockRes, mockNext);
            expect(service.getReportStatusHistory).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockHistory }));
        });
    });
});
//# sourceMappingURL=reports.controllers.spec.js.map