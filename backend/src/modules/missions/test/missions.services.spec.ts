import { Logger } from 'winston';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';
import { MissionRepository } from '../repositories/mission.repositories';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

jest.mock('../repositories/mission.repositories');

// Services
import { GetMissionsService } from '../services/getMissions.service';
import { GetMissionByIdService } from '../services/getMissionById.service';
import { CreateMissionService } from '../services/createMission.service';
import { UpdateMissionService } from '../services/updateMission.service';
import { DeleteMissionService } from '../services/deleteMission.service';
import { GetMissionChecklistService } from '../services/getMissionChecklist.service';
import { AddChecklistItemService } from '../services/addChecklistItem.service';
import { AssignUserToMissionService } from '../services/assignUserToMission.service';
import { GetMissionStatusHistoryService } from '../services/getMissionStatusHistory.service';

describe('Mission Services', () => {
  let missionRepository: jest.Mocked<MissionRepository>;

  beforeEach(() => {
    missionRepository = new MissionRepository({} as any, mockLogger) as jest.Mocked<MissionRepository>;
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET MISSIONS
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetMissionsService', () => {
    let service: GetMissionsService;

    beforeEach(() => {
      service = new GetMissionsService(missionRepository, mockLogger);
    });

    it('doit retourner une liste paginée', async () => {
      const mockResult = {
        data: [{ id: '1', title: 'Réparation caniveau', missionType: 'repair' }],
        total: 1, page: 1, limit: 50, totalPages: 1,
      };
      missionRepository.getAllMissions.mockResolvedValueOnce(mockResult as any);

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
    let service: GetMissionByIdService;

    beforeEach(() => {
      service = new GetMissionByIdService(missionRepository, mockLogger);
    });

    it('doit retourner la mission si trouvée', async () => {
      const mockMission = { id: '1', title: 'Réparation caniveau', missionType: 'repair' };
      missionRepository.getMissionById.mockResolvedValueOnce(mockMission as any);

      const result = await service.getMissionById('1');

      expect(result).toEqual(mockMission);
    });

    it('doit lever NotFoundError si inexistante', async () => {
      missionRepository.getMissionById.mockResolvedValueOnce(null);

      await expect(service.getMissionById('uuid-inexistant')).rejects.toThrow(NotFoundError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE MISSION
  // ─────────────────────────────────────────────────────────────────────────

  describe('CreateMissionService', () => {
    let service: CreateMissionService;

    beforeEach(() => {
      service = new CreateMissionService(missionRepository, mockLogger);
    });

    it('doit lever BadRequestError si champs requis absents', async () => {
      await expect(service.createMission({ municipalityId: '', title: '', missionType: '' as any }))
        .rejects.toThrow(BadRequestError);
    });

    it('doit créer la mission avec le créateur injecté', async () => {
      const payload = { municipalityId: 'terr-1', title: 'Réparation', missionType: 'repair' as any };
      const mockCreated = { id: 'new-uuid', title: 'Réparation' };
      missionRepository.createMission.mockResolvedValueOnce(mockCreated as any);

      const result = await service.createMission(payload, { userId: 'user-1' });

      expect(missionRepository.createMission).toHaveBeenCalledWith(
        expect.objectContaining({ createdBy: 'user-1' })
      );
      expect(result).toEqual(mockCreated);
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE MISSION
  // ─────────────────────────────────────────────────────────────────────────

  describe('UpdateMissionService', () => {
    let service: UpdateMissionService;

    beforeEach(() => {
      service = new UpdateMissionService(missionRepository, mockLogger);
    });

    it('doit mettre à jour la mission', async () => {
      const mockUpdated = { id: '1', title: 'Nouveau titre', missionType: 'repair' };
      missionRepository.updateMission.mockResolvedValueOnce(mockUpdated as any);

      const result = await service.updateMission('1', { title: 'Nouveau titre' });

      expect(result).toEqual(mockUpdated);
    });

    it('doit lever NotFoundError si inexistante', async () => {
      missionRepository.updateMission.mockResolvedValueOnce(null);

      await expect(service.updateMission('uuid-inexistant', { title: 'X' }))
        .rejects.toThrow(NotFoundError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE MISSION
  // ─────────────────────────────────────────────────────────────────────────

  describe('DeleteMissionService', () => {
    let service: DeleteMissionService;

    beforeEach(() => {
      service = new DeleteMissionService(missionRepository, mockLogger);
    });

    it('doit supprimer la mission', async () => {
      missionRepository.deleteMission.mockResolvedValueOnce(undefined);

      await service.deleteMission('1');

      expect(missionRepository.deleteMission).toHaveBeenCalledWith('1');
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('doit propager NotFoundError', async () => {
      const error = new NotFoundError('Mission introuvable');
      missionRepository.deleteMission.mockRejectedValueOnce(error);

      await expect(service.deleteMission('1')).rejects.toThrow(NotFoundError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CHECKLIST
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetMissionChecklistService', () => {
    let service: GetMissionChecklistService;

    beforeEach(() => {
      service = new GetMissionChecklistService(missionRepository, mockLogger);
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
    let service: AddChecklistItemService;

    beforeEach(() => {
      service = new AddChecklistItemService(missionRepository, mockLogger);
    });

    it('doit lever BadRequestError si label vide', async () => {
      await expect(service.addChecklistItem('1', '   ')).rejects.toThrow(BadRequestError);
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
    let service: AssignUserToMissionService;

    beforeEach(() => {
      service = new AssignUserToMissionService(missionRepository, mockLogger);
    });

    it('doit lever BadRequestError si ids absents', async () => {
      await expect(service.assignUserToMission('', '')).rejects.toThrow(BadRequestError);
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
    let service: GetMissionStatusHistoryService;

    beforeEach(() => {
      service = new GetMissionStatusHistoryService(missionRepository, mockLogger);
    });

    it('doit retourner l\'historique des statuts', async () => {
      const mockHistory = [{ id: 'h1', missionId: '1', oldStatus: null, newStatus: 'draft', changedBy: null, createdAt: new Date() }];
      missionRepository.getMissionStatusHistory.mockResolvedValueOnce(mockHistory as any);

      const result = await service.getMissionStatusHistory('1');

      expect(result).toEqual(mockHistory);
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });
});