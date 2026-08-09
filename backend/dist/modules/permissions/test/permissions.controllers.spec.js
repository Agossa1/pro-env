"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Mock des services
jest.mock('../services/getPermissions.service');
jest.mock('../services/getPermissionById.service');
jest.mock('../services/createPermission.service');
jest.mock('../services/updatePermission.service');
jest.mock('../services/deletePermission.service');
jest.mock('../services/getPermissionsByRole.service');
jest.mock('../services/assignPermissionsToRole.service');
jest.mock('../services/removePermissionFromRole.service');
jest.mock('../services/getRolesWithPermissions.service');
// Imports après les mocks
const getPermissions_controller_1 = require("../controller/getPermissions.controller");
const getPermissionById_controller_1 = require("../controller/getPermissionById.controller");
const createPermission_controller_1 = require("../controller/createPermission.controller");
const updatePermission_controller_1 = require("../controller/updatePermission.controller");
const deletePermission_controller_1 = require("../controller/deletePermission.controller");
const getPermissionsByRole_controller_1 = require("../controller/getPermissionsByRole.controller");
const assignPermissionsToRole_controller_1 = require("../controller/assignPermissionsToRole.controller");
const removePermissionFromRole_controller_1 = require("../controller/removePermissionFromRole.controller");
const getRolesWithPermissions_controller_1 = require("../controller/getRolesWithPermissions.controller");
const getPermissions_service_1 = require("../services/getPermissions.service");
const getPermissionById_service_1 = require("../services/getPermissionById.service");
const createPermission_service_1 = require("../services/createPermission.service");
const updatePermission_service_1 = require("../services/updatePermission.service");
const deletePermission_service_1 = require("../services/deletePermission.service");
const getPermissionsByRole_service_1 = require("../services/getPermissionsByRole.service");
const assignPermissionsToRole_service_1 = require("../services/assignPermissionsToRole.service");
const removePermissionFromRole_service_1 = require("../services/removePermissionFromRole.service");
const getRolesWithPermissions_service_1 = require("../services/getRolesWithPermissions.service");
const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';
describe('Permission Controllers', () => {
    let mockReq;
    let mockRes;
    let mockNext;
    beforeEach(() => {
        mockReq = {
            body: {},
            params: {},
            query: {},
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET PERMISSIONS
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetPermissionsController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getPermissions_service_1.GetPermissionsService({}, {});
            controller = new getPermissions_controller_1.GetPermissionsController(service);
        });
        it('doit retourner 200 avec pagination', async () => {
            const mockResult = { data: [{ id: '1', module: 'territory', action: 'read', description: null }], total: 1, page: 1, limit: 50, totalPages: 1 };
            service.getPermissions.mockResolvedValueOnce(mockResult);
            await controller.getPermissions(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: mockResult.data,
                pagination: { total: 1, page: 1, limit: 50, totalPages: 1 },
            }));
        });
        it('doit passer l\'erreur à next() si le service échoue', async () => {
            const error = new Error('Service error');
            service.getPermissions.mockRejectedValueOnce(error);
            await controller.getPermissions(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET PERMISSION BY ID
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetPermissionByIdController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getPermissionById_service_1.GetPermissionByIdService({}, {});
            controller = new getPermissionById_controller_1.GetPermissionByIdController(service);
        });
        it('doit retourner 200 avec la permission', async () => {
            mockReq.params = { id: VALID_UUID };
            const mockPerm = { id: VALID_UUID, module: 'territory', action: 'read', description: null };
            service.getPermissionById.mockResolvedValueOnce(mockPerm);
            await controller.getPermissionById(mockReq, mockRes, mockNext);
            expect(service.getPermissionById).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockPerm }));
        });
        it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            await controller.getPermissionById(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.getPermissionById).not.toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // CREATE PERMISSION
    // ─────────────────────────────────────────────────────────────────────────
    describe('CreatePermissionController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new createPermission_service_1.CreatePermissionService({}, {});
            controller = new createPermission_controller_1.CreatePermissionController(service);
        });
        it('doit retourner 400 si module invalide (Zod)', async () => {
            mockReq.body = { module: 'invalide', action: 'read' };
            await controller.createPermission(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.createPermission).not.toHaveBeenCalled();
        });
        it('doit retourner 201 en cas de succès', async () => {
            mockReq.body = { module: 'territory', action: 'read' };
            const mockCreated = { id: 'new-uuid', module: 'territory', action: 'read', description: null };
            service.createPermission.mockResolvedValueOnce(mockCreated);
            await controller.createPermission(mockReq, mockRes, mockNext);
            expect(service.createPermission).toHaveBeenCalledWith(mockReq.body);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockCreated }));
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE PERMISSION
    // ─────────────────────────────────────────────────────────────────────────
    describe('UpdatePermissionController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new updatePermission_service_1.UpdatePermissionService({}, {});
            controller = new updatePermission_controller_1.UpdatePermissionController(service);
        });
        it('doit retourner 200 en cas de succès', async () => {
            mockReq.params = { id: VALID_UUID };
            mockReq.body = { description: 'New desc' };
            const mockUpdated = { id: VALID_UUID, module: 'territory', action: 'read', description: 'New desc' };
            service.updatePermission.mockResolvedValueOnce(mockUpdated);
            await controller.updatePermission(mockReq, mockRes, mockNext);
            expect(service.updatePermission).toHaveBeenCalledWith(VALID_UUID, mockReq.body);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
        it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            mockReq.body = { description: 'X' };
            await controller.updatePermission(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.updatePermission).not.toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // DELETE PERMISSION
    // ─────────────────────────────────────────────────────────────────────────
    describe('DeletePermissionController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new deletePermission_service_1.DeletePermissionService({}, {});
            controller = new deletePermission_controller_1.DeletePermissionController(service);
        });
        it('doit retourner 200 en cas de succès', async () => {
            mockReq.params = { id: VALID_UUID };
            service.deletePermission.mockResolvedValueOnce(undefined);
            await controller.deletePermission(mockReq, mockRes, mockNext);
            expect(service.deletePermission).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: null }));
        });
        it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            await controller.deletePermission(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.deletePermission).not.toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET PERMISSIONS BY ROLE
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetPermissionsByRoleController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getPermissionsByRole_service_1.GetPermissionsByRoleService({}, {});
            controller = new getPermissionsByRole_controller_1.GetPermissionsByRoleController(service);
        });
        it('doit retourner 200 avec les permissions du rôle', async () => {
            mockReq.params = { roleId: VALID_UUID };
            const mockPerms = [{ id: '1', module: 'territory', action: 'read', description: null }];
            service.getPermissionsByRole.mockResolvedValueOnce(mockPerms);
            await controller.getPermissionsByRole(mockReq, mockRes, mockNext);
            expect(service.getPermissionsByRole).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockPerms }));
        });
        it('doit retourner 400 si roleId invalide', async () => {
            mockReq.params = { roleId: 'uuid-invalide' };
            await controller.getPermissionsByRole(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.getPermissionsByRole).not.toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // ASSIGN PERMISSIONS TO ROLE
    // ─────────────────────────────────────────────────────────────────────────
    describe('AssignPermissionsToRoleController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new assignPermissionsToRole_service_1.AssignPermissionsToRoleService({}, {});
            controller = new assignPermissionsToRole_controller_1.AssignPermissionsToRoleController(service);
        });
        it('doit retourner 200 en cas de succès', async () => {
            mockReq.params = { roleId: VALID_UUID };
            mockReq.body = { permissionIds: [VALID_UUID] };
            const mockAssigned = [{ id: 'rp-1', roleId: VALID_UUID, permissionId: VALID_UUID }];
            service.assignPermissionsToRole.mockResolvedValueOnce(mockAssigned);
            await controller.assignPermissionsToRole(mockReq, mockRes, mockNext);
            expect(service.assignPermissionsToRole).toHaveBeenCalledWith(VALID_UUID, [VALID_UUID]);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockAssigned }));
        });
        it('doit retourner 400 si permissionIds invalides', async () => {
            mockReq.params = { roleId: VALID_UUID };
            mockReq.body = { permissionIds: ['uuid-invalide'] };
            await controller.assignPermissionsToRole(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.assignPermissionsToRole).not.toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // REMOVE PERMISSION FROM ROLE
    // ─────────────────────────────────────────────────────────────────────────
    describe('RemovePermissionFromRoleController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new removePermissionFromRole_service_1.RemovePermissionFromRoleService({}, {});
            controller = new removePermissionFromRole_controller_1.RemovePermissionFromRoleController(service);
        });
        it('doit retourner 200 en cas de succès', async () => {
            mockReq.params = { roleId: VALID_UUID, permissionId: VALID_UUID };
            service.removePermissionFromRole.mockResolvedValueOnce(undefined);
            await controller.removePermissionFromRole(mockReq, mockRes, mockNext);
            expect(service.removePermissionFromRole).toHaveBeenCalledWith(VALID_UUID, VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
        it('doit retourner 400 si params invalides', async () => {
            mockReq.params = { roleId: 'uuid-invalide', permissionId: VALID_UUID };
            await controller.removePermissionFromRole(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.removePermissionFromRole).not.toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET ROLES WITH PERMISSIONS
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetRolesWithPermissionsController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getRolesWithPermissions_service_1.GetRolesWithPermissionsService({}, {});
            controller = new getRolesWithPermissions_controller_1.GetRolesWithPermissionsController(service);
        });
        it('doit retourner 200 avec les rôles', async () => {
            const mockRoles = [{ id: 'role-1', code: 'admin', name: 'Admin', tier: 'platform', canManageUsers: true, canManageRoles: true, permissions: [] }];
            service.getRolesWithPermissions.mockResolvedValueOnce(mockRoles);
            await controller.getRolesWithPermissions(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockRoles }));
        });
        it('doit passer l\'erreur à next() en cas d\'échec', async () => {
            const error = new Error('DB error');
            service.getRolesWithPermissions.mockRejectedValueOnce(error);
            await controller.getRolesWithPermissions(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
//# sourceMappingURL=permissions.controllers.spec.js.map