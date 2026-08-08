"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const permission_repositories_1 = require("../repositories/permission.repositories");
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
describe('PermissionRepository', () => {
    let permissionRepository;
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
        permissionRepository = new permission_repositories_1.PermissionRepository(mockDb, mockLogger);
        jest.clearAllMocks();
    });
    // ─────────────────────────────────────────────────────────────────────────
    // PERMISSIONS — CRUD
    // ─────────────────────────────────────────────────────────────────────────
    describe('getAllPermissions', () => {
        it('doit retourner une liste paginée avec total et totalPages', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query
                .mockResolvedValueOnce({ rows: [{ total: 25 }] }) // count
                .mockResolvedValueOnce({ rows: [{ id: '1', module: 'territory', action: 'read', description: null }] });
            const result = await permissionRepository.getAllPermissions({ page: 1, limit: 10 });
            expect(result.total).toBe(25);
            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
            expect(result.totalPages).toBe(3);
            expect(result.data).toHaveLength(1);
        });
    });
    describe('getPermissionById', () => {
        it('doit retourner la permission si trouvée', async () => {
            const mockPerm = { id: '1', module: 'territory', action: 'read', description: null };
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockPerm] });
            const result = await permissionRepository.getPermissionById('1');
            expect(result).toEqual(mockPerm);
        });
        it('doit retourner null si non trouvée', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            const result = await permissionRepository.getPermissionById('uuid-inexistant');
            expect(result).toBeNull();
        });
    });
    describe('getPermissionByModuleAction', () => {
        it('doit retourner la permission si trouvée', async () => {
            const mockPerm = { id: '1', module: 'territory', action: 'read', description: null };
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockPerm] });
            const result = await permissionRepository.getPermissionByModuleAction('territory', 'read');
            expect(result).toEqual(mockPerm);
        });
        it('doit retourner null si non trouvée', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            const result = await permissionRepository.getPermissionByModuleAction('territory', 'read');
            expect(result).toBeNull();
        });
    });
    describe('createPermission', () => {
        const payload = { module: 'territory', action: 'read', description: 'Lire' };
        it('doit créer une permission dans une transaction et invalider le cache', async () => {
            const mockCreated = { id: 'new-uuid', module: 'territory', action: 'read', description: 'Lire' };
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockResolvedValueOnce({ rows: [mockCreated] }) // INSERT
                .mockResolvedValueOnce(undefined); // COMMIT
            const result = await permissionRepository.createPermission(payload);
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO permissions'), expect.any(Array));
            expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
            expect(redis_service_1.redisCache.invalidatePattern).toHaveBeenCalledWith('permission:all:*');
            expect(mockClient.release).toHaveBeenCalled();
            expect(result).toEqual(mockCreated);
        });
        it('doit faire ROLLBACK et lever BadRequestError si doublon (module, action)', async () => {
            const duplicateError = { code: '23505', constraint: 'permissions_module_action_key', message: 'duplicate' };
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockRejectedValueOnce(duplicateError); // INSERT fails
            await expect(permissionRepository.createPermission(payload)).rejects.toThrow(appErrors_1.BadRequestError);
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockClient.release).toHaveBeenCalled();
        });
    });
    describe('updatePermission', () => {
        it('doit mettre à jour et invalider les caches', async () => {
            const mockUpdated = { id: 'uuid-1', module: 'territory', action: 'read', description: 'New desc' };
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockUpdated] });
            const result = await permissionRepository.updatePermission('uuid-1', { description: 'New desc' });
            expect(result).toEqual(mockUpdated);
            expect(redis_service_1.redisCache.invalidatePattern).toHaveBeenCalledWith('permission:all:*');
            expect(redis_service_1.redisCache.invalidate).toHaveBeenCalledWith('permission:id:uuid-1');
        });
        it('doit lever NotFoundError si ligne non trouvée', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            await expect(permissionRepository.updatePermission('uuid-inexistant', { description: 'X' }))
                .rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    describe('deletePermission', () => {
        it('doit supprimer et invalider les caches', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 1 });
            await permissionRepository.deletePermission('uuid-1');
            expect(redis_service_1.redisCache.invalidatePattern).toHaveBeenCalledWith('permission:all:*');
            expect(redis_service_1.redisCache.invalidate).toHaveBeenCalledWith('permission:id:uuid-1');
        });
        it('doit lever NotFoundError si ligne non trouvée', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            await expect(permissionRepository.deletePermission('uuid-inexistant'))
                .rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // ROLE PERMISSIONS
    // ─────────────────────────────────────────────────────────────────────────
    describe('getPermissionsByRoleId', () => {
        it('doit retourner les permissions du rôle', async () => {
            const mockPerms = [
                { id: '1', module: 'territory', action: 'read', description: null },
                { id: '2', module: 'missions', action: 'create', description: null },
            ];
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rows: mockPerms });
            const result = await permissionRepository.getPermissionsByRoleId('role-uuid');
            expect(result).toEqual(mockPerms);
        });
    });
    describe('assignPermissionsToRole', () => {
        it('doit assigner les permissions dans une transaction', async () => {
            const mockAssigned = [
                { id: 'rp-1', roleId: 'role-uuid', permissionId: 'perm-1' },
            ];
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockResolvedValueOnce({ rowCount: 1, rows: [mockAssigned[0]] }) // INSERT
                .mockResolvedValueOnce(undefined); // COMMIT
            const result = await permissionRepository.assignPermissionsToRole('role-uuid', ['perm-1']);
            expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
            expect(redis_service_1.redisCache.invalidate).toHaveBeenCalledWith('permission:role:role-uuid');
            expect(mockClient.release).toHaveBeenCalled();
            expect(result).toHaveLength(1);
        });
        it('doit lever BadRequestError si rôle/permission introuvable (23503)', async () => {
            const fkError = { code: '23503', message: 'fk violation' };
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockRejectedValueOnce(fkError);
            await expect(permissionRepository.assignPermissionsToRole('role-uuid', ['perm-1']))
                .rejects.toThrow(appErrors_1.BadRequestError);
            expect(mockClient.release).toHaveBeenCalled();
        });
    });
    describe('removePermissionFromRole', () => {
        it('doit retirer la permission et invalider le cache', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 1 });
            await permissionRepository.removePermissionFromRole('role-uuid', 'perm-1');
            expect(redis_service_1.redisCache.invalidate).toHaveBeenCalledWith('permission:role:role-uuid');
        });
        it('doit lever NotFoundError si la permission nest pas assignée', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            await expect(permissionRepository.removePermissionFromRole('role-uuid', 'perm-1'))
                .rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    describe('userHasPermission', () => {
        it('doit retourner true si l\'utilisateur possède la permission', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 1 });
            const result = await permissionRepository.userHasPermission('user-uuid', 'territory', 'read');
            expect(result).toBe(true);
        });
        it('doit retourner false si la permission est absente', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            const result = await permissionRepository.userHasPermission('user-uuid', 'territory', 'read');
            expect(result).toBe(false);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // ROLES WITH PERMISSIONS
    // ─────────────────────────────────────────────────────────────────────────
    describe('getRolesWithPermissions', () => {
        it('doit retourner les rôles avec leurs permissions agrégées', async () => {
            const mockRoles = [
                {
                    id: 'role-1',
                    code: 'admin',
                    name: 'Admin',
                    tier: 'platform',
                    canManageUsers: true,
                    canManageRoles: true,
                    permissions: [{ id: 'p1', module: 'territory', action: 'read', description: null }],
                },
            ];
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rows: mockRoles });
            const result = await permissionRepository.getRolesWithPermissions();
            expect(result).toEqual(mockRoles);
        });
    });
});
//# sourceMappingURL=permission.repositories.spec.js.map