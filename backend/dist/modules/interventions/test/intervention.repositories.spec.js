"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const intervention_repositories_1 = require("../repositories/intervention.repositories");
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
describe('InterventionRepository', () => {
    let interventionRepository;
    let mockDb;
    let mockClient;
    const mockIntervention = {
        id: 'intervention-1',
        missionId: 'mission-1',
        assignedTeamId: 'team-1',
        assignedToUserId: null,
        interventionType: 'cleaning',
        status: 'not_started',
        vehicleNotes: null,
        equipmentNotes: null,
        startedAt: null,
        endedAt: null,
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
        interventionRepository = new intervention_repositories_1.InterventionRepository(mockDb, mockLogger);
        jest.clearAllMocks();
    });
    // ─────────────────────────────────────────────────────────────────────────
    // INTERVENTIONS — CRUD
    // ─────────────────────────────────────────────────────────────────────────
    describe('getAllInterventions', () => {
        it('doit retourner une liste paginée avec total et totalPages', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query
                .mockResolvedValueOnce({ rows: [{ total: 25 }] }) // count
                .mockResolvedValueOnce({ rows: [mockIntervention] }); // data
            const result = await interventionRepository.getAllInterventions({ page: 1, limit: 10 });
            expect(result.total).toBe(25);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
            expect(result.totalPages).toBe(3);
            expect(result.data).toHaveLength(1);
        });
        it('doit appliquer les filtres mission/équipe/statut', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query
                .mockResolvedValueOnce({ rows: [{ total: 3 }] })
                .mockResolvedValueOnce({ rows: [mockIntervention] });
            await interventionRepository.getAllInterventions({
                missionId: 'mission-1',
                teamId: 'team-1',
                status: 'not_started',
            });
            expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('i.mission_id = $1'), expect.arrayContaining(['mission-1']));
        });
    });
    describe('getInterventionById', () => {
        it('doit retourner l\'intervention si trouvée', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockIntervention] });
            const result = await interventionRepository.getInterventionById('intervention-1');
            expect(result).toEqual(mockIntervention);
        });
        it('doit retourner null si non trouvée', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            const result = await interventionRepository.getInterventionById('uuid-inexistant');
            expect(result).toBeNull();
        });
    });
    describe('createIntervention', () => {
        const payload = {
            missionId: 'mission-1',
            assignedSocieteId: 'societe-1',
            interventionType: 'cleaning',
        };
        it('doit créer une intervention dans une transaction et invalider le cache', async () => {
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockResolvedValueOnce({ rows: [{ id: 'intervention-1' }] }) // INSERT
                .mockResolvedValueOnce(undefined); // COMMIT
            // Après COMMIT, getInterventionById est appelé
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockIntervention] });
            const result = await interventionRepository.createIntervention(payload);
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO interventions'), expect.any(Array));
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
            expect(redis_service_1.redisCache.invalidatePattern).toHaveBeenCalledWith('interventions:all:*');
            expect(mockClient.release).toHaveBeenCalled();
            expect(result).toEqual(mockIntervention);
        });
        it('doit faire ROLLBACK et lever BadRequestError si FK violation', async () => {
            const fkError = { code: '23503', message: 'fk violation' };
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockRejectedValueOnce(fkError);
            await expect(interventionRepository.createIntervention(payload)).rejects.toThrow(appErrors_1.BadRequestError);
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockClient.release).toHaveBeenCalled();
        });
    });
    describe('updateIntervention', () => {
        it('doit mettre à jour et invalider les caches', async () => {
            mockDb.query
                .mockResolvedValueOnce({ rowCount: 1, rows: [{ id: 'intervention-1' }] }) // UPDATE
                .mockResolvedValueOnce({ rowCount: 1, rows: [mockIntervention] }); // getInterventionById
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            const result = await interventionRepository.updateIntervention('intervention-1', { status: 'started' });
            expect(result).toEqual(mockIntervention);
            expect(redis_service_1.redisCache.invalidate).toHaveBeenCalledWith('intervention:id:intervention-1');
        });
        it('doit lever NotFoundError si non trouvée', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            await expect(interventionRepository.updateIntervention('uuid-inexistant', { status: 'started' }))
                .rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    describe('deleteIntervention', () => {
        it('doit faire une suppression logique', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 1 });
            await interventionRepository.deleteIntervention('intervention-1');
            expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE interventions SET deleted_at'), ['intervention-1']);
            expect(redis_service_1.redisCache.invalidate).toHaveBeenCalledWith('intervention:id:intervention-1');
        });
        it('doit lever NotFoundError si non trouvée', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            await expect(interventionRepository.deleteIntervention('uuid-inexistant')).rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // FIELD INTERVENTION REPORTS
    // ─────────────────────────────────────────────────────────────────────────
    describe('createFieldReport', () => {
        it('doit créer un rapport terrain et invalider le cache', async () => {
            const mockReport = {
                id: 'report-1',
                interventionId: 'intervention-1',
                reportId: null,
                createdBy: 'user-1',
                workDone: 'Dégagement effectué',
                blockageRemovedPct: 90,
                finalConditionScore: 85,
                recommendations: null,
                completed: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            };
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockResolvedValueOnce({ rows: [mockReport] }) // INSERT
                .mockResolvedValueOnce(undefined); // COMMIT
            const result = await interventionRepository.createFieldReport({
                interventionId: 'intervention-1',
                createdBy: 'user-1',
                workDone: 'Dégagement effectué',
                completed: true,
            });
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO field_intervention_reports'), expect.any(Array));
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
            expect(redis_service_1.redisCache.invalidate).toHaveBeenCalledWith('intervention:id:intervention-1');
            expect(mockClient.release).toHaveBeenCalled();
            expect(result).toEqual(mockReport);
        });
        it('doit faire ROLLBACK et lever BadRequestError si FK violation', async () => {
            const fkError = { code: '23503', message: 'fk violation' };
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockRejectedValueOnce(fkError);
            await expect(interventionRepository.createFieldReport({ interventionId: 'inv-inexistant' }))
                .rejects.toThrow(appErrors_1.BadRequestError);
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockClient.release).toHaveBeenCalled();
        });
    });
    describe('getInterventionReports', () => {
        it('doit retourner les rapports de l\'intervention', async () => {
            const mockReports = [
                { id: 'r1', interventionId: 'intervention-1', reportId: null, createdBy: 'user-1', workDone: 'OK', blockageRemovedPct: 90, finalConditionScore: 85, recommendations: null, completed: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null },
            ];
            mockDb.query.mockResolvedValueOnce({ rows: mockReports });
            const result = await interventionRepository.getInterventionReports('intervention-1');
            expect(result).toEqual(mockReports);
        });
    });
});
//# sourceMappingURL=intervention.repositories.spec.js.map