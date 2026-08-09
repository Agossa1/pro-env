"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Mock des services
jest.mock('../services/getRoles.service');
jest.mock('../services/getRoleById.service');
jest.mock('../services/getRoleByCode.service');
jest.mock('../services/createRole.service');
jest.mock('../services/updateRole.service');
jest.mock('../services/deleteRole.service');
// Imports après les mocks
const getRoles_controller_1 = require("../controller/getRoles.controller");
const getRoleById_controller_1 = require("../controller/getRoleById.controller");
const getRoleByCode_controller_1 = require("../controller/getRoleByCode.controller");
const createRole_controller_1 = require("../controller/createRole.controller");
const updateRole_controller_1 = require("../controller/updateRole.controller");
const deleteRole_controller_1 = require("../controller/deleteRole.controller");
const getRoles_service_1 = require("../services/getRoles.service");
const getRoleById_service_1 = require("../services/getRoleById.service");
const getRoleByCode_service_1 = require("../services/getRoleByCode.service");
const createRole_service_1 = require("../services/createRole.service");
const updateRole_service_1 = require("../services/updateRole.service");
const deleteRole_service_1 = require("../services/deleteRole.service");
const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';
describe('Role Controllers', () => {
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
    // GET ROLES
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetRolesController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getRoles_service_1.GetRolesService({}, {});
            controller = new getRoles_controller_1.GetRolesController(service);
        });
        it('doit retourner 200 avec pagination', async () => {
            const mockResult = {
                data: [{ id: '1', code: 'admin', name: 'Admin' }],
                total: 1, page: 1, limit: 50, totalPages: 1,
            };
            service.getRoles.mockResolvedValueOnce(mockResult);
            await controller.getRoles(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                pagination: { total: 1, page: 1, limit: 50, totalPages: 1 },
            }));
        });
        it('doit passer l\'erreur à next() si le service échoue', async () => {
            const error = new Error('Service error');
            service.getRoles.mockRejectedValueOnce(error);
            await controller.getRoles(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET ROLE BY ID
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetRoleByIdController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getRoleById_service_1.GetRoleByIdService({}, {});
            controller = new getRoleById_controller_1.GetRoleByIdController(service);
        });
        it('doit retourner 200 avec le rôle', async () => {
            mockReq.params = { id: VALID_UUID };
            const mockRole = { id: VALID_UUID, code: 'admin', name: 'Admin' };
            service.getRoleById.mockResolvedValueOnce(mockRole);
            await controller.getRoleById(mockReq, mockRes, mockNext);
            expect(service.getRoleById).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockRole }));
        });
        it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            await controller.getRoleById(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.getRoleById).not.toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET ROLE BY CODE
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetRoleByCodeController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getRoleByCode_service_1.GetRoleByCodeService({}, {});
            controller = new getRoleByCode_controller_1.GetRoleByCodeController(service);
        });
        it('doit retourner 200 avec le rôle', async () => {
            mockReq.params = { code: 'super_admin' };
            const mockRole = { id: '1', code: 'super_admin', name: 'Super Admin' };
            service.getRoleByCode.mockResolvedValueOnce(mockRole);
            await controller.getRoleByCode(mockReq, mockRes, mockNext);
            expect(service.getRoleByCode).toHaveBeenCalledWith('super_admin');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockRole }));
        });
        it('doit retourner 400 si le code est vide', async () => {
            mockReq.params = { code: '' };
            await controller.getRoleByCode(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.getRoleByCode).not.toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // CREATE ROLE
    // ─────────────────────────────────────────────────────────────────────────
    describe('CreateRoleController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new createRole_service_1.CreateRoleService({}, {});
            controller = new createRole_controller_1.CreateRoleController(service);
        });
        it('doit retourner 400 si validation Zod échoue', async () => {
            mockReq.body = { code: '', name: '' };
            await controller.createRole(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.createRole).not.toHaveBeenCalled();
        });
        it('doit retourner 201 en cas de succès', async () => {
            mockReq.body = { code: 'admin', name: 'Admin' };
            const mockCreated = { id: 'new-uuid', code: 'admin', name: 'Admin' };
            service.createRole.mockResolvedValueOnce(mockCreated);
            await controller.createRole(mockReq, mockRes, mockNext);
            expect(service.createRole).toHaveBeenCalledWith(mockReq.body);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockCreated }));
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE ROLE
    // ─────────────────────────────────────────────────────────────────────────
    describe('UpdateRoleController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new updateRole_service_1.UpdateRoleService({}, {});
            controller = new updateRole_controller_1.UpdateRoleController(service);
        });
        it('doit retourner 200 en cas de succès', async () => {
            mockReq.params = { id: VALID_UUID };
            mockReq.body = { name: 'New Name' };
            const mockUpdated = { id: VALID_UUID, code: 'admin', name: 'New Name' };
            service.updateRole.mockResolvedValueOnce(mockUpdated);
            await controller.updateRole(mockReq, mockRes, mockNext);
            expect(service.updateRole).toHaveBeenCalledWith(VALID_UUID, mockReq.body);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockUpdated }));
        });
        it('doit retourner 400 si l\'id invalide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            mockReq.body = { name: 'X' };
            await controller.updateRole(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.updateRole).not.toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // DELETE ROLE
    // ─────────────────────────────────────────────────────────────────────────
    describe('DeleteRoleController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new deleteRole_service_1.DeleteRoleService({}, {});
            controller = new deleteRole_controller_1.DeleteRoleController(service);
        });
        it('doit retourner 200 en cas de succès', async () => {
            mockReq.params = { id: VALID_UUID };
            service.deleteRole.mockResolvedValueOnce(undefined);
            await controller.deleteRole(mockReq, mockRes, mockNext);
            expect(service.deleteRole).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: null }));
        });
        it('doit retourner 400 si l\'id invalide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            await controller.deleteRole(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.deleteRole).not.toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=roles.controllers.spec.js.map