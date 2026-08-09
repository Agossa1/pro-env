"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Mock des services
jest.mock('../services/getInterventions.service');
jest.mock('../services/getInterventionById.service');
jest.mock('../services/createIntervention.service');
jest.mock('../services/updateIntervention.service');
jest.mock('../services/deleteIntervention.service');
jest.mock('../services/createFieldReport.service');
jest.mock('../services/getInterventionReports.service');
// Imports après les mocks
const getInterventions_controller_1 = require("../controller/getInterventions.controller");
const getInterventionById_controller_1 = require("../controller/getInterventionById.controller");
const createIntervention_controller_1 = require("../controller/createIntervention.controller");
const updateIntervention_controller_1 = require("../controller/updateIntervention.controller");
const deleteIntervention_controller_1 = require("../controller/deleteIntervention.controller");
const createFieldReport_controller_1 = require("../controller/createFieldReport.controller");
const getInterventionReports_controller_1 = require("../controller/getInterventionReports.controller");
const getInterventions_service_1 = require("../services/getInterventions.service");
const getInterventionById_service_1 = require("../services/getInterventionById.service");
const createIntervention_service_1 = require("../services/createIntervention.service");
const updateIntervention_service_1 = require("../services/updateIntervention.service");
const deleteIntervention_service_1 = require("../services/deleteIntervention.service");
const createFieldReport_service_1 = require("../services/createFieldReport.service");
const getInterventionReports_service_1 = require("../services/getInterventionReports.service");
const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';
describe('Intervention Controllers', () => {
    let mockReq;
    let mockRes;
    let mockNext;
    beforeEach(() => {
        mockReq = { body: {}, params: {}, query: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });
    describe('GetInterventionsController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getInterventions_service_1.GetInterventionsService({}, {});
            controller = new getInterventions_controller_1.GetInterventionsController(service);
        });
        it('doit retourner 200 avec pagination', async () => {
            const mockResult = { data: [{ id: '1', interventionType: 'cleaning', status: 'not_started' }], total: 1, page: 1, limit: 50, totalPages: 1 };
            service.getInterventions.mockResolvedValueOnce(mockResult);
            await controller.getInterventions(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                pagination: { total: 1, page: 1, limit: 50, totalPages: 1 },
            }));
        });
        it('doit passer l\'erreur à next()', async () => {
            const error = new Error('Service error');
            service.getInterventions.mockRejectedValueOnce(error);
            await controller.getInterventions(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    describe('GetInterventionByIdController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getInterventionById_service_1.GetInterventionByIdService({}, {});
            controller = new getInterventionById_controller_1.GetInterventionByIdController(service);
        });
        it('doit retourner 200 avec l\'intervention', async () => {
            mockReq.params = { id: VALID_UUID };
            const mockIntervention = { id: VALID_UUID, interventionType: 'cleaning', status: 'not_started' };
            service.getInterventionById.mockResolvedValueOnce(mockIntervention);
            await controller.getInterventionById(mockReq, mockRes, mockNext);
            expect(service.getInterventionById).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockIntervention }));
        });
        it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            await controller.getInterventionById(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.getInterventionById).not.toHaveBeenCalled();
        });
    });
    describe('CreateInterventionController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new createIntervention_service_1.CreateInterventionService({}, {});
            controller = new createIntervention_controller_1.CreateInterventionController(service);
        });
        it('doit retourner 400 si validation Zod échoue', async () => {
            mockReq.body = { missionId: 'uuid-invalide', assignedTeamId: '', interventionType: '' };
            await controller.createIntervention(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.createIntervention).not.toHaveBeenCalled();
        });
        it('doit retourner 201 en cas de succès', async () => {
            mockReq.body = { missionId: VALID_UUID, assignedTeamId: VALID_UUID, interventionType: 'cleaning' };
            const mockCreated = { id: 'new-uuid', interventionType: 'cleaning', status: 'not_started' };
            service.createIntervention.mockResolvedValueOnce(mockCreated);
            await controller.createIntervention(mockReq, mockRes, mockNext);
            expect(service.createIntervention).toHaveBeenCalledWith(mockReq.body);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockCreated }));
        });
    });
    describe('UpdateInterventionController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new updateIntervention_service_1.UpdateInterventionService({}, {});
            controller = new updateIntervention_controller_1.UpdateInterventionController(service);
        });
        it('doit retourner 200 en cas de succès', async () => {
            mockReq.params = { id: VALID_UUID };
            mockReq.body = { status: 'started' };
            const mockUpdated = { id: VALID_UUID, interventionType: 'cleaning', status: 'started' };
            service.updateIntervention.mockResolvedValueOnce(mockUpdated);
            await controller.updateIntervention(mockReq, mockRes, mockNext);
            expect(service.updateIntervention).toHaveBeenCalledWith(VALID_UUID, mockReq.body);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
        it('doit retourner 400 si l\'id invalide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            mockReq.body = { status: 'started' };
            await controller.updateIntervention(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.updateIntervention).not.toHaveBeenCalled();
        });
    });
    describe('DeleteInterventionController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new deleteIntervention_service_1.DeleteInterventionService({}, {});
            controller = new deleteIntervention_controller_1.DeleteInterventionController(service);
        });
        it('doit retourner 200 en cas de succès', async () => {
            mockReq.params = { id: VALID_UUID };
            service.deleteIntervention.mockResolvedValueOnce(undefined);
            await controller.deleteIntervention(mockReq, mockRes, mockNext);
            expect(service.deleteIntervention).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: null }));
        });
    });
    describe('CreateFieldReportController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new createFieldReport_service_1.CreateFieldReportService({}, {});
            controller = new createFieldReport_controller_1.CreateFieldReportController(service);
        });
        it('doit retourner 201 en cas de succès avec l\'auteur', async () => {
            mockReq.params = { id: VALID_UUID };
            mockReq.body = { workDone: 'Travaux effectués', completed: true };
            mockReq.user = { userId: 'user-1' };
            const mockReport = { id: 'r1', interventionId: VALID_UUID, createdBy: 'user-1', workDone: 'Travaux effectués', completed: true };
            service.createFieldReport.mockResolvedValueOnce(mockReport);
            await controller.createFieldReport(mockReq, mockRes, mockNext);
            expect(service.createFieldReport).toHaveBeenCalledWith(expect.objectContaining({ interventionId: VALID_UUID }), expect.objectContaining({ userId: 'user-1' }));
            expect(mockRes.status).toHaveBeenCalledWith(201);
        });
    });
    describe('GetInterventionReportsController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getInterventionReports_service_1.GetInterventionReportsService({}, {});
            controller = new getInterventionReports_controller_1.GetInterventionReportsController(service);
        });
        it('doit retourner 200 avec les rapports', async () => {
            mockReq.params = { id: VALID_UUID };
            const mockReports = [{ id: 'r1', interventionId: VALID_UUID, createdBy: 'user-1', completed: true }];
            service.getInterventionReports.mockResolvedValueOnce(mockReports);
            await controller.getInterventionReports(mockReq, mockRes, mockNext);
            expect(service.getInterventionReports).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockReports }));
        });
    });
});
//# sourceMappingURL=interventions.controllers.spec.js.map