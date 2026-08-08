"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appErrors_1 = require("../../../shared/errors/appErrors");
const role_repositories_1 = require("../repositories/role.repositories");
// Mock dependencies
const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
};
jest.mock('../repositories/role.repositories');
// Services
const getRoles_service_1 = require("../services/getRoles.service");
const getRoleById_service_1 = require("../services/getRoleById.service");
const getRoleByCode_service_1 = require("../services/getRoleByCode.service");
const createRole_service_1 = require("../services/createRole.service");
const updateRole_service_1 = require("../services/updateRole.service");
const deleteRole_service_1 = require("../services/deleteRole.service");
describe('Role Services', () => {
    let roleRepository;
    beforeEach(() => {
        roleRepository = new role_repositories_1.RoleRepository({}, mockLogger);
        jest.clearAllMocks();
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET ROLES
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetRolesService', () => {
        let service;
        beforeEach(() => {
            service = new getRoles_service_1.GetRolesService(roleRepository, mockLogger);
        });
        it('doit retourner une liste paginée', async () => {
            const mockResult = {
                data: [{ id: '1', code: 'admin', name: 'Admin', description: null, tier: 'platform', routePrefix: null, dashboardPath: null, pageIds: [], canManageUsers: true, canManageRoles: false, createdAt: new Date(), updatedAt: new Date() }],
                total: 1, page: 1, limit: 50, totalPages: 1,
            };
            roleRepository.getAllRoles.mockResolvedValueOnce(mockResult);
            const result = await service.getRoles({ page: 1, limit: 50 });
            expect(result).toEqual(mockResult);
            expect(mockLogger.info).toHaveBeenCalled();
        });
        it('doit logger et propager l\'erreur', async () => {
            const error = new Error('DB error');
            roleRepository.getAllRoles.mockRejectedValueOnce(error);
            await expect(service.getRoles()).rejects.toThrow('DB error');
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET ROLE BY ID
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetRoleByIdService', () => {
        let service;
        beforeEach(() => {
            service = new getRoleById_service_1.GetRoleByIdService(roleRepository, mockLogger);
        });
        it('doit retourner le rôle si trouvé', async () => {
            const mockRole = { id: '1', code: 'admin', name: 'Admin' };
            roleRepository.getRoleById.mockResolvedValueOnce(mockRole);
            const result = await service.getRoleById('1');
            expect(result).toEqual(mockRole);
        });
        it('doit lever NotFoundError si inexistant', async () => {
            roleRepository.getRoleById.mockResolvedValueOnce(null);
            await expect(service.getRoleById('uuid-inexistant')).rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET ROLE BY CODE
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetRoleByCodeService', () => {
        let service;
        beforeEach(() => {
            service = new getRoleByCode_service_1.GetRoleByCodeService(roleRepository, mockLogger);
        });
        it('doit retourner le rôle si trouvé', async () => {
            const mockRole = { id: '1', code: 'super_admin', name: 'Super Admin' };
            roleRepository.getRoleByCode.mockResolvedValueOnce(mockRole);
            const result = await service.getRoleByCode('super_admin');
            expect(result).toEqual(mockRole);
        });
        it('doit lever NotFoundError si code inexistant', async () => {
            roleRepository.getRoleByCode.mockResolvedValueOnce(null);
            await expect(service.getRoleByCode('inexistant')).rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // CREATE ROLE
    // ─────────────────────────────────────────────────────────────────────────
    describe('CreateRoleService', () => {
        let service;
        beforeEach(() => {
            service = new createRole_service_1.CreateRoleService(roleRepository, mockLogger);
        });
        it('doit créer un rôle avec code en minuscule', async () => {
            roleRepository.getRoleByCode.mockResolvedValueOnce(null);
            const mockCreated = { id: 'new-uuid', code: 'admin', name: 'Admin' };
            roleRepository.createRole.mockResolvedValueOnce(mockCreated);
            const result = await service.createRole({ code: 'ADMIN', name: 'Admin' });
            expect(result.code).toBe('admin');
            expect(mockLogger.info).toHaveBeenCalled();
        });
        it('doit lever BadRequestError si code vide', async () => {
            await expect(service.createRole({ code: '   ', name: 'X' }))
                .rejects.toThrow(appErrors_1.BadRequestError);
        });
        it('doit lever BadRequestError si code déjà existant', async () => {
            roleRepository.getRoleByCode.mockResolvedValueOnce({ id: '1', code: 'admin', name: 'Admin' });
            await expect(service.createRole({ code: 'admin', name: 'Admin' }))
                .rejects.toThrow(appErrors_1.BadRequestError);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE ROLE
    // ─────────────────────────────────────────────────────────────────────────
    describe('UpdateRoleService', () => {
        let service;
        beforeEach(() => {
            service = new updateRole_service_1.UpdateRoleService(roleRepository, mockLogger);
        });
        it('doit mettre à jour le rôle', async () => {
            const mockUpdated = { id: '1', code: 'admin', name: 'New Name' };
            roleRepository.updateRole.mockResolvedValueOnce(mockUpdated);
            const result = await service.updateRole('1', { name: 'New Name' });
            expect(result).toEqual(mockUpdated);
        });
        it('doit lever NotFoundError si inexistant', async () => {
            roleRepository.updateRole.mockResolvedValueOnce(null);
            await expect(service.updateRole('uuid-inexistant', { name: 'X' }))
                .rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // DELETE ROLE
    // ─────────────────────────────────────────────────────────────────────────
    describe('DeleteRoleService', () => {
        let service;
        beforeEach(() => {
            service = new deleteRole_service_1.DeleteRoleService(roleRepository, mockLogger);
        });
        it('doit supprimer le rôle', async () => {
            roleRepository.deleteRole.mockResolvedValueOnce(undefined);
            await service.deleteRole('1');
            expect(roleRepository.deleteRole).toHaveBeenCalledWith('1');
            expect(mockLogger.info).toHaveBeenCalled();
        });
        it('doit propager BadRequestError si utilisateurs rattachés', async () => {
            const error = new appErrors_1.BadRequestError('Utilisateurs rattachés');
            roleRepository.deleteRole.mockRejectedValueOnce(error);
            await expect(service.deleteRole('1')).rejects.toThrow(appErrors_1.BadRequestError);
        });
        it('doit propager NotFoundError', async () => {
            const error = new appErrors_1.NotFoundError('Rôle introuvable');
            roleRepository.deleteRole.mockRejectedValueOnce(error);
            await expect(service.deleteRole('1')).rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
});
//# sourceMappingURL=roles.services.spec.js.map