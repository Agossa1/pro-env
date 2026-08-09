"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const societe_repositories_1 = require("../repositories/societe.repositories");
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
describe('SocieteRepository', () => {
    let societeRepository;
    let mockDb;
    let mockClient;
    const mockSociete = {
        id: 'soc-1',
        name: 'BTP Bénin',
        type: 'PRIVATE_COMPANY',
        registrationNumber: 'RCCM-001',
        contactEmail: null,
        contactPhone: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };
    beforeEach(() => {
        mockDb = new postgres_1.default();
        mockClient = {
            query: jest.fn(),
            release: jest.fn(),
        };
        mockDb.query = jest.fn();
        mockDb.getClient = jest.fn().mockResolvedValue(mockClient);
        societeRepository = new societe_repositories_1.SocieteRepository(mockDb, mockLogger);
        jest.clearAllMocks();
    });
    // ─────────────────────────────────────────────────────────────────────────
    // CRUD SOCIETES
    // ─────────────────────────────────────────────────────────────────────────
    describe('getAllSocietes', () => {
        it('doit retourner une liste paginée avec total et totalPages', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query
                .mockResolvedValueOnce({ rows: [{ total: 25 }] }) // count
                .mockResolvedValueOnce({ rows: [mockSociete] }); // data
            const result = await societeRepository.getAllSocietes({ page: 1, limit: 10 });
            expect(result.total).toBe(25);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
            expect(result.totalPages).toBe(3);
            expect(result.data).toHaveLength(1);
        });
    });
    describe('getSocieteById', () => {
        it('doit retourner la société si trouvée', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockSociete] });
            const result = await societeRepository.getSocieteById('soc-1');
            expect(result).toEqual(mockSociete);
        });
        it('doit retourner null si non trouvée', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            const result = await societeRepository.getSocieteById('uuid-inexistant');
            expect(result).toBeNull();
        });
    });
    describe('getSocieteByRegistrationNumber', () => {
        it('doit retourner la société par n° d\'enregistrement', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockSociete] });
            const result = await societeRepository.getSocieteByRegistrationNumber('RCCM-001');
            expect(result).toEqual(mockSociete);
        });
        it('doit retourner null si non trouvée', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            const result = await societeRepository.getSocieteByRegistrationNumber('INEXISTANT');
            expect(result).toBeNull();
        });
    });
    describe('createSociete', () => {
        const payload = { name: 'BTP Bénin', type: 'PRIVATE_COMPANY' };
        it('doit créer une société dans une transaction et invalider le cache', async () => {
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockResolvedValueOnce({ rows: [mockSociete] }) // INSERT
                .mockResolvedValueOnce(undefined); // COMMIT
            const result = await societeRepository.createSociete(payload);
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO organizations'), expect.any(Array));
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
            expect(redis_service_1.redisCache.invalidatePattern).toHaveBeenCalledWith('societes:all:*');
            expect(mockClient.release).toHaveBeenCalled();
            expect(result).toEqual(mockSociete);
        });
        it('doit associer la société à un territoire (mairie/ministère)', async () => {
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockResolvedValueOnce({ rows: [mockSociete] }) // INSERT organizations
                .mockResolvedValueOnce({ rowCount: 1 }) // INSERT organization_territories
                .mockResolvedValueOnce(undefined); // COMMIT
            const result = await societeRepository.createSociete({
                ...payload,
                territoryId: 'territory-uuid',
            });
            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO organization_territories'), expect.any(Array));
            expect(redis_service_1.redisCache.invalidate).toHaveBeenCalledWith(`societes:territories:${mockSociete.id}`);
            expect(mockClient.release).toHaveBeenCalled();
            expect(result).toEqual(mockSociete);
        });
        it('doit faire ROLLBACK et lever BadRequestError si n° enregistrement dupliqué', async () => {
            const duplicateError = { code: '23505', constraint: 'organizations_registration_number_key', message: 'duplicate' };
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockRejectedValueOnce(duplicateError); // INSERT fails
            await expect(societeRepository.createSociete(payload)).rejects.toThrow(appErrors_1.BadRequestError);
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockClient.release).toHaveBeenCalled();
        });
    });
    describe('updateSociete', () => {
        it('doit mettre à jour et invalider les caches', async () => {
            const mockUpdated = { ...mockSociete, name: 'New Name' };
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockUpdated] });
            const result = await societeRepository.updateSociete('soc-1', { name: 'New Name' });
            expect(result).toEqual(mockUpdated);
            expect(redis_service_1.redisCache.invalidatePattern).toHaveBeenCalledWith('societes:all:*');
            expect(redis_service_1.redisCache.invalidate).toHaveBeenCalledWith('societes:id:soc-1');
        });
        it('doit lever NotFoundError si ligne non trouvée', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            await expect(societeRepository.updateSociete('uuid-inexistant', { name: 'X' }))
                .rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    describe('deleteSociete', () => {
        it('doit supprimer et invalider les caches', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 1 });
            await societeRepository.deleteSociete('soc-1');
            expect(redis_service_1.redisCache.invalidatePattern).toHaveBeenCalledWith('societes:all:*');
            expect(redis_service_1.redisCache.invalidate).toHaveBeenCalledWith('societes:id:soc-1');
        });
        it('doit lever NotFoundError si société inexistante', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            await expect(societeRepository.deleteSociete('uuid-inexistant'))
                .rejects.toThrow(appErrors_1.NotFoundError);
        });
        it('doit lever BadRequestError si FK violation (23503)', async () => {
            const fkError = { code: '23503', message: 'fk violation' };
            mockDb.query.mockRejectedValueOnce(fkError);
            await expect(societeRepository.deleteSociete('soc-1'))
                .rejects.toThrow(appErrors_1.BadRequestError);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // TERRITOIRES DE COMPÉTENCE
    // ─────────────────────────────────────────────────────────────────────────
    describe('getSocieteTerritories', () => {
        it('doit retourner les territoires de compétence', async () => {
            const mockTerritories = [
                { id: 'ot-1', societeId: 'soc-1', territoryId: 'terr-1', isActive: true },
            ];
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rows: mockTerritories });
            const result = await societeRepository.getSocieteTerritories('soc-1');
            expect(result).toEqual(mockTerritories);
        });
    });
});
//# sourceMappingURL=societe.repositories.spec.js.map