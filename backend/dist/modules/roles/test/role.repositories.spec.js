"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const role_repositories_1 = require("../repositories/role.repositories");
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
describe('RoleRepository', () => {
    let roleRepository;
    let mockDb;
    let mockClient;
    const mockRole = {
        id: 'role-1',
        code: 'admin',
        name: 'Admin',
        description: null,
        tier: 'platform',
        routePrefix: null,
        dashboardPath: null,
        pageIds: [],
        canManageUsers: true,
        canManageRoles: false,
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
        roleRepository = new role_repositories_1.RoleRepository(mockDb, mockLogger);
        jest.clearAllMocks();
    });
    // ─────────────────────────────────────────────────────────────────────────
    // ROLES — CRUD
    // ─────────────────────────────────────────────────────────────────────────
    describe('getAllRoles', () => {
        it('doit retourner une liste paginée avec total et totalPages', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query
                .mockResolvedValueOnce({ rows: [{ total: 25 }] }) // count
                .mockResolvedValueOnce({ rows: [mockRole] }); // data
            const result = await roleRepository.getAllRoles({ page: 1, limit: 10 });
            expect(result.total).toBe(25);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
            expect(result.totalPages).toBe(3);
            expect(result.data).toHaveLength(1);
        });
    });
    describe('getRoleById', () => {
        it('doit retourner le rôle si trouvé', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockRole] });
            const result = await roleRepository.getRoleById('role-1');
            expect(result).toEqual(mockRole);
        });
        it('doit retourner null si non trouvé', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            const result = await roleRepository.getRoleById('uuid-inexistant');
            expect(result).toBeNull();
        });
    });
    describe('getRoleByCode', () => {
        it('doit retourner le rôle par code', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockRole] });
            const result = await roleRepository.getRoleByCode('admin');
            expect(result).toEqual(mockRole);
        });
        it('doit retourner null si code non trouvé', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            const result = await roleRepository.getRoleByCode('inexistant');
            expect(result).toBeNull();
        });
    });
    describe('createRole', () => {
        const payload = { code: 'admin', name: 'Admin' };
        it('doit créer un rôle dans une transaction et invalider le cache', async () => {
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockResolvedValueOnce({ rows: [mockRole] }) // INSERT
                .mockResolvedValueOnce(undefined); // COMMIT
            const result = await roleRepository.createRole(payload);
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO roles'), expect.any(Array));
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
            expect(redis_service_1.redisCache.invalidatePattern).toHaveBeenCalledWith('roles:all:*');
            expect(mockClient.release).toHaveBeenCalled();
            expect(result).toEqual(mockRole);
        });
        it('doit faire ROLLBACK et lever BadRequestError si code dupliqué', async () => {
            const duplicateError = { code: '23505', constraint: 'roles_code_key', message: 'duplicate' };
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockRejectedValueOnce(duplicateError); // INSERT fails
            await expect(roleRepository.createRole(payload)).rejects.toThrow(appErrors_1.BadRequestError);
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockClient.release).toHaveBeenCalled();
        });
    });
    describe('updateRole', () => {
        it('doit mettre à jour et invalider les caches', async () => {
            const mockUpdated = { ...mockRole, name: 'New Name' };
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockUpdated] });
            const result = await roleRepository.updateRole('role-1', { name: 'New Name' });
            expect(result).toEqual(mockUpdated);
            expect(redis_service_1.redisCache.invalidatePattern).toHaveBeenCalledWith('roles:all:*');
            expect(redis_service_1.redisCache.invalidate).toHaveBeenCalledWith('roles:id:role-1');
        });
        it('doit lever NotFoundError si ligne non trouvée', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            await expect(roleRepository.updateRole('uuid-inexistant', { name: 'X' }))
                .rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    describe('countUsersByRole', () => {
        it('doit retourner le nombre d\'utilisateurs', async () => {
            mockDb.query.mockResolvedValueOnce({ rows: [{ total: 5 }] });
            const result = await roleRepository.countUsersByRole('role-1');
            expect(result).toBe(5);
            expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('COUNT(*)'), ['role-1']);
        });
    });
    describe('deleteRole', () => {
        it('doit lever BadRequestError si des utilisateurs sont rattachés', async () => {
            mockDb.query.mockResolvedValueOnce({ rows: [{ total: 3 }] }); // countUsersByRole
            await expect(roleRepository.deleteRole('role-1')).rejects.toThrow(appErrors_1.BadRequestError);
        });
        it('doit supprimer le rôle si aucun utilisateur et invalider les caches', async () => {
            mockDb.query
                .mockResolvedValueOnce({ rows: [{ total: 0 }] }) // countUsersByRole
                .mockResolvedValueOnce({ rowCount: 1 }); // DELETE
            await roleRepository.deleteRole('role-1');
            expect(redis_service_1.redisCache.invalidatePattern).toHaveBeenCalledWith('roles:all:*');
            expect(redis_service_1.redisCache.invalidate).toHaveBeenCalledWith('roles:id:role-1');
        });
        it('doit lever NotFoundError si rôle inexistant', async () => {
            mockDb.query
                .mockResolvedValueOnce({ rows: [{ total: 0 }] }) // countUsersByRole
                .mockResolvedValueOnce({ rowCount: 0 }); // DELETE
            await expect(roleRepository.deleteRole('uuid-inexistant')).rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
});
//# sourceMappingURL=role.repositories.spec.js.map