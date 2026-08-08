"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const territory_repositories_1 = require("../repositories/territory.repositories");
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
describe('TerritoryRepository', () => {
    let territoryRepository;
    let mockDb;
    let mockClient;
    beforeEach(() => {
        mockDb = new postgres_1.default();
        mockClient = {
            query: jest.fn(),
            release: jest.fn(),
        };
        mockDb.query = jest.fn();
        mockDb.getClient = jest.fn().mockResolvedValue(mockClient);
        territoryRepository = new territory_repositories_1.TerritoryRepository(mockDb, mockLogger);
        jest.clearAllMocks();
    });
    // ─────────────────────────────────────────────────────────────────────────
    // TERRITORY TYPES
    // ─────────────────────────────────────────────────────────────────────────
    describe('getAllTerritoryTypes', () => {
        it('doit retourner une liste paginée avec total et totalPages', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query
                .mockResolvedValueOnce({ rows: [{ total: 25 }] }) // count
                .mockResolvedValueOnce({ rows: [{ id: '1', code: 'DEP', name: 'Department', hierarchyLevel: 1 }] });
            const result = await territoryRepository.getAllTerritoryTypes({ page: 1, limit: 10 });
            expect(result.total).toBe(25);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
            expect(result.totalPages).toBe(3);
            expect(result.data).toHaveLength(1);
        });
    });
    describe('getTerritoryTypeByCode', () => {
        it('doit retourner le type si trouvé', async () => {
            const mockType = { id: '1', code: 'DEPARTMENT', name: 'Department', hierarchyLevel: 1 };
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockType] });
            const result = await territoryRepository.getTerritoryTypeByCode('DEPARTMENT');
            expect(result).toEqual(mockType);
        });
        it('doit retourner null si non trouvé', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            const result = await territoryRepository.getTerritoryTypeByCode('INEXISTANT');
            expect(result).toBeNull();
        });
    });
    describe('getTerritoryTypeById', () => {
        it('doit retourner le type si trouvé', async () => {
            const mockType = { id: 'uuid-1', code: 'DEPARTMENT', name: 'Department', hierarchyLevel: 1 };
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockType] });
            const result = await territoryRepository.getTerritoryTypeById('uuid-1');
            expect(result).toEqual(mockType);
        });
        it('doit retourner null si non trouvé', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            const result = await territoryRepository.getTerritoryTypeById('uuid-inexistant');
            expect(result).toBeNull();
        });
    });
    describe('createTerritoryType', () => {
        const payload = { code: 'PROVINCE', name: 'Province', hierarchyLevel: 2 };
        it('doit créer un type dans une transaction et invalider le cache', async () => {
            const mockCreated = { id: 'new-uuid', code: 'PROVINCE', name: 'Province', hierarchyLevel: 2 };
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockResolvedValueOnce({ rows: [mockCreated] }) // INSERT
                .mockResolvedValueOnce(undefined); // COMMIT
            const result = await territoryRepository.createTerritoryType(payload);
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO territory_types'), expect.any(Array));
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
            expect(redis_service_1.redisCache.invalidatePattern).toHaveBeenCalledWith('territory:types:all:*');
            expect(mockClient.release).toHaveBeenCalled();
            expect(result).toEqual(mockCreated);
        });
        it('doit faire ROLLBACK et lever BadRequestError si code dupliqué', async () => {
            const duplicateError = { code: '23505', constraint: 'territory_types_code_key', message: 'duplicate' };
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockRejectedValueOnce(duplicateError); // INSERT fails
            await expect(territoryRepository.createTerritoryType(payload)).rejects.toThrow(appErrors_1.BadRequestError);
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockClient.release).toHaveBeenCalled();
        });
    });
    describe('updateTerritoryType', () => {
        it('doit mettre à jour et invalider les caches', async () => {
            const mockUpdated = { id: 'uuid-1', code: 'DEP', name: 'New Name', hierarchyLevel: 2 };
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockUpdated] });
            const result = await territoryRepository.updateTerritoryType('uuid-1', { name: 'New Name' });
            expect(result).toEqual(mockUpdated);
            expect(redis_service_1.redisCache.invalidatePattern).toHaveBeenCalledWith('territory:types:all:*');
            expect(redis_service_1.redisCache.invalidate).toHaveBeenCalledWith('territory:type:id:uuid-1');
        });
        it('doit lever NotFoundError si ligne non trouvée', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            await expect(territoryRepository.updateTerritoryType('uuid-inexistant', { name: 'X' }))
                .rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    describe('deleteTerritoryType', () => {
        it('doit supprimer et invalider les caches', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 1 });
            await territoryRepository.deleteTerritoryType('uuid-1');
            expect(redis_service_1.redisCache.invalidatePattern).toHaveBeenCalledWith('territory:types:all:*');
            expect(redis_service_1.redisCache.invalidate).toHaveBeenCalledWith('territory:type:id:uuid-1');
        });
        it('doit lever NotFoundError si ligne non trouvée', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            await expect(territoryRepository.deleteTerritoryType('uuid-inexistant'))
                .rejects.toThrow(appErrors_1.NotFoundError);
        });
        it('doit lever BadRequestError si FK violation (23503)', async () => {
            const fkError = { code: '23503', message: 'fk violation' };
            mockDb.query.mockRejectedValueOnce(fkError);
            await expect(territoryRepository.deleteTerritoryType('uuid-1'))
                .rejects.toThrow(appErrors_1.BadRequestError);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // TERRITORIES
    // ─────────────────────────────────────────────────────────────────────────
    describe('getTerritoryById', () => {
        it('doit retourner le territoire avec géométries GeoJSON', async () => {
            const mockTerritory = {
                id: 'uuid-t',
                territoryTypeId: 'uuid-tt',
                name: 'Cotonou',
                code: 'BJ-LI-CO',
                geometry: '{"type":"MultiPolygon","coordinates":[]}',
            };
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockTerritory] });
            const result = await territoryRepository.getTerritoryById('uuid-t');
            expect(result).toEqual(mockTerritory);
        });
        it('doit retourner null si non trouvé', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            const result = await territoryRepository.getTerritoryById('uuid-inexistant');
            expect(result).toBeNull();
        });
    });
    describe('existsTerritoryByCode', () => {
        it('doit retourner true si le code existe', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 1 });
            const exists = await territoryRepository.existsTerritoryByCode('BJ-LI-CO');
            expect(exists).toBe(true);
        });
        it('doit retourner false si le code n\'existe pas', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 0 });
            const exists = await territoryRepository.existsTerritoryByCode('INEXISTANT');
            expect(exists).toBe(false);
        });
    });
    describe('getTerritoryByCode', () => {
        it('doit retourner le territoire par code', async () => {
            const mockTerritory = { id: 'uuid-t', code: 'BJ-LI-CO', name: 'Cotonou' };
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockTerritory] });
            const result = await territoryRepository.getTerritoryByCode('BJ-LI-CO');
            expect(result).toEqual(mockTerritory);
        });
        it('doit retourner null si code non trouvé', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            const result = await territoryRepository.getTerritoryByCode('INEXISTANT');
            expect(result).toBeNull();
        });
    });
    describe('getAllTerritories', () => {
        it('doit retourner une liste paginée avec filtres optionnels', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query
                .mockResolvedValueOnce({ rows: [{ total: 10 }] }) // count
                .mockResolvedValueOnce({ rows: [{ id: '1', name: 'Cotonou' }] });
            const result = await territoryRepository.getAllTerritories({
                page: 1,
                limit: 50,
                territoryTypeId: 'type-uuid',
            });
            expect(result.total).toBe(10);
            expect(result.data).toHaveLength(1);
        });
    });
    describe('createTerritory', () => {
        const payload = {
            territoryTypeId: 'type-uuid',
            name: 'Test Territory',
            code: 'BJ-TEST',
            geometry: { type: 'MultiPolygon', coordinates: [] },
            status: 'ACTIVE',
        };
        it('doit créer un territoire dans une transaction complète', async () => {
            const mockTerritory = { id: 'new-uuid', name: 'Test Territory', code: 'BJ-TEST' };
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockResolvedValueOnce({ rows: [mockTerritory] }) // INSERT territories
                .mockResolvedValueOnce({ rowCount: 0 }) // INSERT territory_sectors (no sector)
                .mockResolvedValueOnce({ rowCount: 0 }) // INSERT organization_territories (no org)
                .mockResolvedValueOnce(undefined); // COMMIT
            const result = await territoryRepository.createTerritory(payload);
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO territories'), expect.any(Array));
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
            expect(redis_service_1.redisCache.invalidatePattern).toHaveBeenCalledWith('territory:all:*');
            expect(mockClient.release).toHaveBeenCalled();
            expect(result).toEqual(mockTerritory);
        });
        it('doit faire ROLLBACK et lever BadRequestError si code dupliqué', async () => {
            const duplicateError = { code: '23505', constraint: 'territories_code_key', message: 'duplicate' };
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockRejectedValueOnce(duplicateError);
            await expect(territoryRepository.createTerritory(payload)).rejects.toThrow(appErrors_1.BadRequestError);
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockClient.release).toHaveBeenCalled();
        });
        it('doit faire ROLLBACK et lever BadRequestError si FK violation', async () => {
            const fkError = { code: '23503', message: 'fk violation' };
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockRejectedValueOnce(fkError);
            await expect(territoryRepository.createTerritory(payload)).rejects.toThrow(appErrors_1.BadRequestError);
            expect(mockClient.release).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=territory.repositories.spec.js.map