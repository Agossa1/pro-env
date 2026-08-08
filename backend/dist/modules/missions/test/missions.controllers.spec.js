"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Mock des services
jest.mock('../services/getMissions.service');
jest.mock('../services/getMissionById.service');
jest.mock('../services/createMission.service');
jest.mock('../services/updateMission.service');
jest.mock('../services/deleteMission.service');
jest.mock('../services/getMissionChecklist.service');
jest.mock('../services/addChecklistItem.service');
jest.mock('../services/assignUserToMission.service');
jest.mock('../services/getMissionStatusHistory.service');
// Imports après les mocks
const getMissions_controller_1 = require("../controller/getMissions.controller");
const getMissionById_controller_1 = require("../controller/getMissionById.controller");
const createMission_controller_1 = require("../controller/createMission.controller");
const updateMission_controller_1 = require("../controller/updateMission.controller");
const deleteMission_controller_1 = require("../controller/deleteMission.controller");
const getMissionChecklist_controller_1 = require("../controller/getMissionChecklist.controller");
const addChecklistItem_controller_1 = require("../controller/addChecklistItem.controller");
const assignUserToMission_controller_1 = require("../controller/assignUserToMission.controller");
const getMissionStatusHistory_controller_1 = require("../controller/getMissionStatusHistory.controller");
const getMissions_service_1 = require("../services/getMissions.service");
const getMissionById_service_1 = require("../services/getMissionById.service");
const createMission_service_1 = require("../services/createMission.service");
const updateMission_service_1 = require("../services/updateMission.service");
const deleteMission_service_1 = require("../services/deleteMission.service");
const getMissionChecklist_service_1 = require("../services/getMissionChecklist.service");
const addChecklistItem_service_1 = require("../services/addChecklistItem.service");
const assignUserToMission_service_1 = require("../services/assignUserToMission.service");
const getMissionStatusHistory_service_1 = require("../services/getMissionStatusHistory.service");
const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';
describe('Mission Controllers', () => {
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
    // GET MISSIONS
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetMissionsController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getMissions_service_1.GetMissionsService({}, {});
            controller = new getMissions_controller_1.GetMissionsController(service);
        });
        it('doit retourner 200 avec pagination', async () => {
            const mockResult = {
                data: [{ id: '1', title: 'Réparation caniveau', missionType: 'repair' }],
                total: 1, page: 1, limit: 50, totalPages: 1,
            };
            service.getMissions.mockResolvedValueOnce(mockResult);
            await controller.getMissions(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                pagination: { total: 1, page: 1, limit: 50, totalPages: 1 },
            }));
        });
        it('doit passer l\'erreur à next()', async () => {
            const error = new Error('Service error');
            service.getMissions.mockRejectedValueOnce(error);
            await controller.getMissions(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET MISSION BY ID
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetMissionByIdController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getMissionById_service_1.GetMissionByIdService({}, {});
            controller = new getMissionById_controller_1.GetMissionByIdController(service);
        });
        it('doit retourner 200 avec la mission', async () => {
            mockReq.params = { id: VALID_UUID };
            const mockMission = { id: VALID_UUID, title: 'Réparation', missionType: 'repair' };
            service.getMissionById.mockResolvedValueOnce(mockMission);
            await controller.getMissionById(mockReq, mockRes, mockNext);
            expect(service.getMissionById).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockMission }));
        });
        it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            await controller.getMissionById(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.getMissionById).not.toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // CREATE MISSION
    // ─────────────────────────────────────────────────────────────────────────
    describe('CreateMissionController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new createMission_service_1.CreateMissionService({}, {});
            controller = new createMission_controller_1.CreateMissionController(service);
        });
        it('doit retourner 400 si validation Zod échoue', async () => {
            mockReq.body = { territoryId: 'uuid-invalide', title: '', missionType: 'invalide' };
            await controller.createMission(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.createMission).not.toHaveBeenCalled();
        });
        it('doit retourner 201 en cas de succès avec le créateur', async () => {
            mockReq.body = { territoryId: VALID_UUID, title: 'Réparation', missionType: 'repair' };
            mockReq.user = { userId: 'user-1' };
            const mockCreated = { id: 'new-uuid', title: 'Réparation', missionType: 'repair' };
            service.createMission.mockResolvedValueOnce(mockCreated);
            await controller.createMission(mockReq, mockRes, mockNext);
            expect(service.createMission).toHaveBeenCalledWith(mockReq.body, expect.objectContaining({ userId: 'user-1' }));
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockCreated }));
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE MISSION
    // ─────────────────────────────────────────────────────────────────────────
    describe('UpdateMissionController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new updateMission_service_1.UpdateMissionService({}, {});
            controller = new updateMission_controller_1.UpdateMissionController(service);
        });
        it('doit retourner 200 en cas de succès', async () => {
            mockReq.params = { id: VALID_UUID };
            mockReq.body = { title: 'Nouveau titre' };
            const mockUpdated = { id: VALID_UUID, title: 'Nouveau titre', missionType: 'repair' };
            service.updateMission.mockResolvedValueOnce(mockUpdated);
            await controller.updateMission(mockReq, mockRes, mockNext);
            expect(service.updateMission).toHaveBeenCalledWith(VALID_UUID, mockReq.body);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
        it('doit retourner 400 si l\'id invalide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            mockReq.body = { title: 'X' };
            await controller.updateMission(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.updateMission).not.toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // DELETE MISSION
    // ─────────────────────────────────────────────────────────────────────────
    describe('DeleteMissionController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new deleteMission_service_1.DeleteMissionService({}, {});
            controller = new deleteMission_controller_1.DeleteMissionController(service);
        });
        it('doit retourner 200 en cas de succès', async () => {
            mockReq.params = { id: VALID_UUID };
            service.deleteMission.mockResolvedValueOnce(undefined);
            await controller.deleteMission(mockReq, mockRes, mockNext);
            expect(service.deleteMission).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: null }));
        });
        it('doit retourner 400 si l\'id invalide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            await controller.deleteMission(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.deleteMission).not.toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // CHECKLIST
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetMissionChecklistController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getMissionChecklist_service_1.GetMissionChecklistService({}, {});
            controller = new getMissionChecklist_controller_1.GetMissionChecklistController(service);
        });
        it('doit retourner 200 avec la checklist', async () => {
            mockReq.params = { id: VALID_UUID };
            const mockItems = [{ id: 'c1', missionId: VALID_UUID, label: 'Vérifier', done: false, doneBy: null, doneAt: null, sortOrder: 1, createdAt: new Date() }];
            service.getMissionChecklist.mockResolvedValueOnce(mockItems);
            await controller.getMissionChecklist(mockReq, mockRes, mockNext);
            expect(service.getMissionChecklist).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockItems }));
        });
    });
    describe('AddChecklistItemController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new addChecklistItem_service_1.AddChecklistItemService({}, {});
            controller = new addChecklistItem_controller_1.AddChecklistItemController(service);
        });
        it('doit retourner 201 en cas de succès', async () => {
            mockReq.params = { id: VALID_UUID };
            mockReq.body = { label: 'Vérifier' };
            const mockItem = { id: 'c1', missionId: VALID_UUID, label: 'Vérifier', done: false, doneBy: null, doneAt: null, sortOrder: 1, createdAt: new Date() };
            service.addChecklistItem.mockResolvedValueOnce(mockItem);
            await controller.addChecklistItem(mockReq, mockRes, mockNext);
            expect(service.addChecklistItem).toHaveBeenCalledWith(VALID_UUID, 'Vérifier');
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockItem }));
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // ASSIGNMENTS
    // ─────────────────────────────────────────────────────────────────────────
    describe('AssignUserToMissionController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new assignUserToMission_service_1.AssignUserToMissionService({}, {});
            controller = new assignUserToMission_controller_1.AssignUserToMissionController(service);
        });
        it('doit retourner 200 en cas de succès', async () => {
            mockReq.params = { id: VALID_UUID };
            mockReq.body = { userId: VALID_UUID };
            mockReq.user = { userId: 'admin-1' };
            const mockAssignment = { id: 'a1', missionId: VALID_UUID, userId: VALID_UUID, assignedBy: 'admin-1', isActive: true, assignedAt: new Date(), unassignedAt: null };
            service.assignUserToMission.mockResolvedValueOnce(mockAssignment);
            await controller.assignUserToMission(mockReq, mockRes, mockNext);
            expect(service.assignUserToMission).toHaveBeenCalledWith(VALID_UUID, VALID_UUID, expect.objectContaining({ assignedBy: 'admin-1' }));
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // STATUT HISTORY
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetMissionStatusHistoryController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getMissionStatusHistory_service_1.GetMissionStatusHistoryService({}, {});
            controller = new getMissionStatusHistory_controller_1.GetMissionStatusHistoryController(service);
        });
        it('doit retourner 200 avec l\'historique', async () => {
            mockReq.params = { id: VALID_UUID };
            const mockHistory = [{ id: 'h1', missionId: VALID_UUID, oldStatus: null, newStatus: 'draft', changedBy: null, createdAt: new Date() }];
            service.getMissionStatusHistory.mockResolvedValueOnce(mockHistory);
            await controller.getMissionStatusHistory(mockReq, mockRes, mockNext);
            expect(service.getMissionStatusHistory).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockHistory }));
        });
    });
});
//# sourceMappingURL=missions.controllers.spec.js.map