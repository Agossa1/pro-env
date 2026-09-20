import { MissionRepository } from '../repositories/mission.repositories';
import { MissionStatus } from '../types/mission.enums';
import PostgresDatabase from '../../../config/database/postgres';
import { Logger } from 'winston';
import { redisCache } from '../../../infra/redis/redis.service';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';

// Mock du logger
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

// Mock complet de PostgresDatabase
jest.mock('@/config/database/postgres');
jest.mock('@/infra/redis/redis.service', () => ({
  redisCache: {
    getOrSet: jest.fn(),
    invalidate: jest.fn(),
    invalidatePattern: jest.fn(),
  }
}));

describe('MissionRepository', () => {
  let missionRepository: MissionRepository;
  let mockDb: jest.Mocked<PostgresDatabase>;
  let mockClient: { query: jest.Mock; release: jest.Mock };

  const mockMission = {
    id: 'mission-1',
    municipalityId: 'terr-1',
    reportId: null,
    missionType: 'repair',
    priorityLevel: 'high',
    title: 'Réparation caniveau',
    description: null,
    status: 'draft',
    assignedOrganizationId: null,
    assignedTeamId: null,
    rejectedReason: null,
    scheduledAt: null,
    dueDate: null,
    completedAt: null,
    estimatedHours: null,
    actualHours: null,
    createdBy: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    mockDb = new PostgresDatabase() as jest.Mocked<PostgresDatabase>;

    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    mockDb.query = jest.fn();
    mockDb.getClient = jest.fn().mockResolvedValue(mockClient);

    missionRepository = new MissionRepository(mockDb, mockLogger);
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // MISSIONS — CRUD
  // ─────────────────────────────────────────────────────────────────────────

  describe('getAllMissions', () => {
    it('doit retourner une liste paginée avec total et totalPages', async () => {
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());

      mockDb.query
        .mockResolvedValueOnce({ rows: [{ total: 25 }] }) // count
        .mockResolvedValueOnce({ rows: [mockMission] }); // data

      const result = await missionRepository.getAllMissions({ page: 1, limit: 10 });

      expect(result.total).toBe(25);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(3);
      expect(result.data).toHaveLength(1);
    });

    it('doit appliquer les filtres territoire/statut/type', async () => {
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());

      mockDb.query
        .mockResolvedValueOnce({ rows: [{ total: 3 }] })
        .mockResolvedValueOnce({ rows: [mockMission] });

      await missionRepository.getAllMissions({
        municipalityId: 'terr-1',
        status: 'draft',
        missionType: 'repair',
      });

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('m.municipality_id = $1'),
        expect.arrayContaining(['terr-1'])
      );
    });
  });

  describe('getMissionById', () => {
    it('doit retourner la mission si trouvée', async () => {
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());
      mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockMission] });

      const result = await missionRepository.getMissionById('mission-1');

      expect(result).toEqual(mockMission);
    });

    it('doit retourner null si non trouvée', async () => {
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());
      mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const result = await missionRepository.getMissionById('uuid-inexistant');

      expect(result).toBeNull();
    });
  });

  describe('createMission', () => {
    const payload = {
      municipalityId: 'terr-1',
      title: 'Réparation caniveau',
      missionType: 'repair' as any,
      createdBy: 'user-1',
    };

    it('doit créer une mission dans une transaction et invalider le cache', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 'mission-1', status: 'draft' }] }) // INSERT
        .mockResolvedValueOnce(undefined); // COMMIT
      // Après COMMIT, getMissionById est appelé
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());
      mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockMission] });

      const result = await missionRepository.createMission(payload);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO missions'), expect.any(Array));
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(redisCache.invalidatePattern).toHaveBeenCalledWith('missions:all:*');
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toEqual(mockMission);
    });

    it('doit faire ROLLBACK et lever BadRequestError si FK violation', async () => {
      const fkError = { code: '23503', message: 'fk violation' };
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockRejectedValueOnce(fkError);

      await expect(missionRepository.createMission(payload)).rejects.toThrow(BadRequestError);
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('updateMission', () => {
    it('doit mettre à jour et invalider les caches', async () => {
      mockDb.query
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 'mission-1' }] }) // UPDATE
        .mockResolvedValueOnce({ rowCount: 1, rows: [mockMission] }); // getMissionById
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());

      const result = await missionRepository.updateMission('mission-1', { title: 'Nouveau titre' });

      expect(result).toEqual(mockMission);
      expect(redisCache.invalidate).toHaveBeenCalledWith('mission:id:mission-1');
    });

    it('doit lever NotFoundError si non trouvée', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      await expect(missionRepository.updateMission('uuid-inexistant', { title: 'X' }))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteMission', () => {
    it('doit faire une suppression logique', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 1 });

      await missionRepository.deleteMission('mission-1');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE missions SET deleted_at'),
        ['mission-1']
      );
      expect(redisCache.invalidate).toHaveBeenCalledWith('mission:id:mission-1');
    });

    it('doit lever NotFoundError si non trouvée', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      await expect(missionRepository.deleteMission('uuid-inexistant')).rejects.toThrow(NotFoundError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CHECKLIST
  // ─────────────────────────────────────────────────────────────────────────

  describe('getMissionChecklist', () => {
    it('doit retourner la checklist', async () => {
      const mockItems = [
        { id: 'c1', missionId: 'mission-1', label: 'Vérifier la zone', done: false, doneBy: null, doneAt: null, sortOrder: 1, createdAt: new Date() },
      ];
      mockDb.query.mockResolvedValueOnce({ rows: mockItems });

      const result = await missionRepository.getMissionChecklist('mission-1');

      expect(result).toEqual(mockItems);
    });
  });

  describe('addChecklistItem', () => {
    it('doit ajouter un élément et invalider le cache', async () => {
      const mockItem = { id: 'c1', missionId: 'mission-1', label: 'Vérifier', done: false, doneBy: null, doneAt: null, sortOrder: 1, createdAt: new Date() };
      mockDb.query.mockResolvedValueOnce({ rows: [mockItem] });

      const result = await missionRepository.addChecklistItem('mission-1', 'Vérifier');

      expect(result).toEqual(mockItem);
      expect(redisCache.invalidate).toHaveBeenCalledWith('mission:id:mission-1');
    });

    it('doit lever BadRequestError si mission introuvable (23503)', async () => {
      const fkError = { code: '23503', message: 'fk' };
      mockDb.query.mockRejectedValueOnce(fkError);

      await expect(missionRepository.addChecklistItem('uuid-inexistant', 'X'))
        .rejects.toThrow(BadRequestError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ASSIGNMENTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('getMissionAssignments', () => {
    it('doit retourner les assignations actives', async () => {
      const mockAssignments = [
        { id: 'a1', missionId: 'mission-1', userId: 'user-1', assignedBy: null, isActive: true, assignedAt: new Date(), unassignedAt: null },
      ];
      mockDb.query.mockResolvedValueOnce({ rows: mockAssignments });

      const result = await missionRepository.getMissionAssignments('mission-1');

      expect(result).toEqual(mockAssignments);
    });
  });

  describe('assignUserToMission', () => {
    it('doit assigner un utilisateur', async () => {
      const mockAssignment = { id: 'a1', missionId: 'mission-1', userId: 'user-1', assignedBy: 'admin', isActive: true, assignedAt: new Date(), unassignedAt: null };
      mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockAssignment] });

      const result = await missionRepository.assignUserToMission('mission-1', 'user-1', 'admin');

      expect(result).toEqual(mockAssignment);
      expect(redisCache.invalidate).toHaveBeenCalledWith('mission:id:mission-1');
    });

    it('doit lever BadRequestError si déjà assigné', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      await expect(missionRepository.assignUserToMission('mission-1', 'user-1'))
        .rejects.toThrow(BadRequestError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // STATUT HISTORY
  // ─────────────────────────────────────────────────────────────────────────

  describe('getMissionStatusHistory', () => {
    it('doit retourner l\'historique des statuts', async () => {
      const mockHistory = [
        { id: 'h1', missionId: 'mission-1', oldStatus: null, newStatus: MissionStatus.DRAFT, changedBy: null, createdAt: new Date() },
      ];
      mockDb.query.mockResolvedValueOnce({ rows: mockHistory });

      const result = await missionRepository.getMissionStatusHistory('mission-1');

      expect(result).toEqual(mockHistory);
    });
  });
});