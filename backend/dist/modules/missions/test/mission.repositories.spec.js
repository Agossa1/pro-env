"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mission_repositories_1 = require("../repositories/mission.repositories");
const mission_enums_1 = require("../types/mission.enums");
const postgres_1 = __importDefault(require("../../../config/database/postgres"));
const redis_service_1 = require("../../../infra/redis/redis.service");
const appErrors_1 = require("../../../shared/errors/appErrors");
// Mock du logger
const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
};
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
    let missionRepository;
    let mockDb;
    let mockClient;
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
        mockDb = new postgres_1.default();
        mockClient = {
            query: jest.fn(),
            release: jest.fn(),
        };
        mockDb.query = jest.fn();
        mockDb.getClient = jest.fn().mockResolvedValue(mockClient);
        missionRepository = new mission_repositories_1.MissionRepository(mockDb, mockLogger);
        jest.clearAllMocks();
    });
    // ─────────────────────────────────────────────────────────────────────────
    // MISSIONS — CRUD
    // ─────────────────────────────────────────────────────────────────────────
    describe('getAllMissions', () => {
        it('doit retourner une liste paginée avec total et totalPages', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
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
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query
                .mockResolvedValueOnce({ rows: [{ total: 3 }] })
                .mockResolvedValueOnce({ rows: [mockMission] });
            await missionRepository.getAllMissions({
                municipalityId: 'terr-1',
                status: 'draft',
                missionType: 'repair',
            });
            expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('m.territory_id = $1'), expect.arrayContaining(['terr-1']));
        });
    });
    describe('getMissionById', () => {
        it('doit retourner la mission si trouvée', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockMission] });
            const result = await missionRepository.getMissionById('mission-1');
            expect(result).toEqual(mockMission);
        });
        it('doit retourner null si non trouvée', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            const result = await missionRepository.getMissionById('uuid-inexistant');
            expect(result).toBeNull();
        });
    });
    describe('createMission', () => {
        const payload = {
            municipalityId: 'terr-1',
            title: 'Réparation caniveau',
            missionType: 'repair',
            createdBy: 'user-1',
        };
        it('doit créer une mission dans une transaction et invalider le cache', async () => {
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockResolvedValueOnce({ rows: [{ id: 'mission-1', status: 'draft' }] }) // INSERT
                .mockResolvedValueOnce(undefined); // COMMIT
            // Après COMMIT, getMissionById est appelé
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockMission] });
            const result = await missionRepository.createMission(payload);
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO missions'), expect.any(Array));
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
            expect(redis_service_1.redisCache.invalidatePattern).toHaveBeenCalledWith('missions:all:*');
            expect(mockClient.release).toHaveBeenCalled();
            expect(result).toEqual(mockMission);
        });
        it('doit faire ROLLBACK et lever BadRequestError si FK violation', async () => {
            const fkError = { code: '23503', message: 'fk violation' };
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockRejectedValueOnce(fkError);
            await expect(missionRepository.createMission(payload)).rejects.toThrow(appErrors_1.BadRequestError);
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockClient.release).toHaveBeenCalled();
        });
    });
    describe('updateMission', () => {
        it('doit mettre à jour et invalider les caches', async () => {
            mockDb.query
                .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 'mission-1' }] }) // UPDATE
                .mockResolvedValueOnce({ rowCount: 1, rows: [mockMission] }); // getMissionById
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            const result = await missionRepository.updateMission('mission-1', { title: 'Nouveau titre' });
            expect(result).toEqual(mockMission);
            expect(redis_service_1.redisCache.invalidate).toHaveBeenCalledWith('mission:id:mission-1');
        });
        it('doit lever NotFoundError si non trouvée', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            await expect(missionRepository.updateMission('uuid-inexistant', { title: 'X' }))
                .rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    describe('deleteMission', () => {
        it('doit faire une suppression logique', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 1 });
            await missionRepository.deleteMission('mission-1');
            expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE missions SET deleted_at'), ['mission-1']);
            expect(redis_service_1.redisCache.invalidate).toHaveBeenCalledWith('mission:id:mission-1');
        });
        it('doit lever NotFoundError si non trouvée', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            await expect(missionRepository.deleteMission('uuid-inexistant')).rejects.toThrow(appErrors_1.NotFoundError);
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
            expect(redis_service_1.redisCache.invalidate).toHaveBeenCalledWith('mission:id:mission-1');
        });
        it('doit lever BadRequestError si mission introuvable (23503)', async () => {
            const fkError = { code: '23503', message: 'fk' };
            mockDb.query.mockRejectedValueOnce(fkError);
            await expect(missionRepository.addChecklistItem('uuid-inexistant', 'X'))
                .rejects.toThrow(appErrors_1.BadRequestError);
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
            expect(redis_service_1.redisCache.invalidate).toHaveBeenCalledWith('mission:id:mission-1');
        });
        it('doit lever BadRequestError si déjà assigné', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            await expect(missionRepository.assignUserToMission('mission-1', 'user-1'))
                .rejects.toThrow(appErrors_1.BadRequestError);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // STATUT HISTORY
    // ─────────────────────────────────────────────────────────────────────────
    describe('getMissionStatusHistory', () => {
        it('doit retourner l\'historique des statuts', async () => {
            const mockHistory = [
                { id: 'h1', missionId: 'mission-1', oldStatus: null, newStatus: mission_enums_1.MissionStatus.DRAFT, changedBy: null, createdAt: new Date() },
            ];
            mockDb.query.mockResolvedValueOnce({ rows: mockHistory });
            const result = await missionRepository.getMissionStatusHistory('mission-1');
            expect(result).toEqual(mockHistory);
        });
    });
});
//# sourceMappingURL=mission.repositories.spec.js.map