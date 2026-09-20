"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appErrors_1 = require("../../../shared/errors/appErrors");
const mission_repositories_1 = require("../repositories/mission.repositories");
// Mock dependencies
const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
};
jest.mock('../repositories/mission.repositories');
// Services
const getMissions_service_1 = require("../services/getMissions.service");
const getMissionById_service_1 = require("../services/getMissionById.service");
const createMission_service_1 = require("../services/createMission.service");
const updateMission_service_1 = require("../services/updateMission.service");
const deleteMission_service_1 = require("../services/deleteMission.service");
const getMissionChecklist_service_1 = require("../services/getMissionChecklist.service");
const addChecklistItem_service_1 = require("../services/addChecklistItem.service");
const assignUserToMission_service_1 = require("../services/assignUserToMission.service");
const getMissionStatusHistory_service_1 = require("../services/getMissionStatusHistory.service");
describe('Mission Services', () => {
    let missionRepository;
    beforeEach(() => {
        missionRepository = new mission_repositories_1.MissionRepository({}, mockLogger);
        jest.clearAllMocks();
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET MISSIONS
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetMissionsService', () => {
        let service;
        beforeEach(() => {
            service = new getMissions_service_1.GetMissionsService(missionRepository, mockLogger);
        });
        it('doit retourner une liste paginée', async () => {
            const mockResult = {
                data: [{ id: '1', title: 'Réparation caniveau', missionType: 'repair' }],
                total: 1, page: 1, limit: 50, totalPages: 1,
            };
            missionRepository.getAllMissions.mockResolvedValueOnce(mockResult);
            const result = await service.getMissions({ page: 1, limit: 50 });
            expect(result).toEqual(mockResult);
            expect(mockLogger.info).toHaveBeenCalled();
        });
        it('doit logger et propager l\'erreur', async () => {
            const error = new Error('DB error');
            missionRepository.getAllMissions.mockRejectedValueOnce(error);
            await expect(service.getMissions()).rejects.toThrow('DB error');
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET MISSION BY ID
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetMissionByIdService', () => {
        let service;
        beforeEach(() => {
            service = new getMissionById_service_1.GetMissionByIdService(missionRepository, mockLogger);
        });
        it('doit retourner la mission si trouvée', async () => {
            const mockMission = { id: '1', title: 'Réparation caniveau', missionType: 'repair' };
            missionRepository.getMissionById.mockResolvedValueOnce(mockMission);
            const result = await service.getMissionById('1');
            expect(result).toEqual(mockMission);
        });
        it('doit lever NotFoundError si inexistante', async () => {
            missionRepository.getMissionById.mockResolvedValueOnce(null);
            await expect(service.getMissionById('uuid-inexistant')).rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // CREATE MISSION
    // ─────────────────────────────────────────────────────────────────────────
    describe('CreateMissionService', () => {
        let service;
        beforeEach(() => {
            service = new createMission_service_1.CreateMissionService(missionRepository, mockLogger);
        });
        it('doit lever BadRequestError si champs requis absents', async () => {
            await expect(service.createMission({ municipalityId: '', title: '', missionType: '' }))
                .rejects.toThrow(appErrors_1.BadRequestError);
        });
        it('doit créer la mission avec le créateur injecté', async () => {
            const payload = { municipalityId: 'terr-1', title: 'Réparation', missionType: 'repair' };
            const mockCreated = { id: 'new-uuid', title: 'Réparation' };
            missionRepository.createMission.mockResolvedValueOnce(mockCreated);
            const result = await service.createMission(payload, { userId: 'user-1' });
            expect(missionRepository.createMission).toHaveBeenCalledWith(expect.objectContaining({ createdBy: 'user-1' }));
            expect(result).toEqual(mockCreated);
            expect(mockLogger.info).toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE MISSION
    // ─────────────────────────────────────────────────────────────────────────
    describe('UpdateMissionService', () => {
        let service;
        beforeEach(() => {
            service = new updateMission_service_1.UpdateMissionService(missionRepository, mockLogger);
        });
        it('doit mettre à jour la mission', async () => {
            const mockUpdated = { id: '1', title: 'Nouveau titre', missionType: 'repair' };
            missionRepository.updateMission.mockResolvedValueOnce(mockUpdated);
            const result = await service.updateMission('1', { title: 'Nouveau titre' });
            expect(result).toEqual(mockUpdated);
        });
        it('doit lever NotFoundError si inexistante', async () => {
            missionRepository.updateMission.mockResolvedValueOnce(null);
            await expect(service.updateMission('uuid-inexistant', { title: 'X' }))
                .rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // DELETE MISSION
    // ─────────────────────────────────────────────────────────────────────────
    describe('DeleteMissionService', () => {
        let service;
        beforeEach(() => {
            service = new deleteMission_service_1.DeleteMissionService(missionRepository, mockLogger);
        });
        it('doit supprimer la mission', async () => {
            missionRepository.deleteMission.mockResolvedValueOnce(undefined);
            await service.deleteMission('1');
            expect(missionRepository.deleteMission).toHaveBeenCalledWith('1');
            expect(mockLogger.info).toHaveBeenCalled();
        });
        it('doit propager NotFoundError', async () => {
            const error = new appErrors_1.NotFoundError('Mission introuvable');
            missionRepository.deleteMission.mockRejectedValueOnce(error);
            await expect(service.deleteMission('1')).rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // CHECKLIST
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetMissionChecklistService', () => {
        let service;
        beforeEach(() => {
            service = new getMissionChecklist_service_1.GetMissionChecklistService(missionRepository, mockLogger);
        });
        it('doit retourner la checklist', async () => {
            const mockItems = [{ id: 'c1', missionId: '1', label: 'Vérifier', done: false, doneBy: null, doneAt: null, sortOrder: 1, createdAt: new Date() }];
            missionRepository.getMissionChecklist.mockResolvedValueOnce(mockItems);
            const result = await service.getMissionChecklist('1');
            expect(result).toEqual(mockItems);
            expect(mockLogger.info).toHaveBeenCalled();
        });
    });
    describe('AddChecklistItemService', () => {
        let service;
        beforeEach(() => {
            service = new addChecklistItem_service_1.AddChecklistItemService(missionRepository, mockLogger);
        });
        it('doit lever BadRequestError si label vide', async () => {
            await expect(service.addChecklistItem('1', '   ')).rejects.toThrow(appErrors_1.BadRequestError);
        });
        it('doit ajouter l\'élément', async () => {
            const mockItem = { id: 'c1', missionId: '1', label: 'Vérifier', done: false, doneBy: null, doneAt: null, sortOrder: 1, createdAt: new Date() };
            missionRepository.addChecklistItem.mockResolvedValueOnce(mockItem);
            const result = await service.addChecklistItem('1', 'Vérifier');
            expect(result).toEqual(mockItem);
            expect(mockLogger.info).toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // ASSIGNMENTS
    // ─────────────────────────────────────────────────────────────────────────
    describe('AssignUserToMissionService', () => {
        let service;
        beforeEach(() => {
            service = new assignUserToMission_service_1.AssignUserToMissionService(missionRepository, mockLogger);
        });
        it('doit lever BadRequestError si ids absents', async () => {
            await expect(service.assignUserToMission('', '')).rejects.toThrow(appErrors_1.BadRequestError);
        });
        it('doit assigner l\'utilisateur', async () => {
            const mockAssignment = { id: 'a1', missionId: '1', userId: 'user-1', assignedBy: null, isActive: true, assignedAt: new Date(), unassignedAt: null };
            missionRepository.assignUserToMission.mockResolvedValueOnce(mockAssignment);
            const result = await service.assignUserToMission('1', 'user-1', { assignedBy: 'admin' });
            expect(missionRepository.assignUserToMission).toHaveBeenCalledWith('1', 'user-1', 'admin');
            expect(result).toEqual(mockAssignment);
            expect(mockLogger.info).toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // STATUT HISTORY
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetMissionStatusHistoryService', () => {
        let service;
        beforeEach(() => {
            service = new getMissionStatusHistory_service_1.GetMissionStatusHistoryService(missionRepository, mockLogger);
        });
        it('doit retourner l\'historique des statuts', async () => {
            const mockHistory = [{ id: 'h1', missionId: '1', oldStatus: null, newStatus: 'draft', changedBy: null, createdAt: new Date() }];
            missionRepository.getMissionStatusHistory.mockResolvedValueOnce(mockHistory);
            const result = await service.getMissionStatusHistory('1');
            expect(result).toEqual(mockHistory);
            expect(mockLogger.info).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=missions.services.spec.js.map