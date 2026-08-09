import type { Request, Response, NextFunction } from 'express';

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
import { GetPermissionsController } from '../controller/getPermissions.controller';
import { GetPermissionByIdController } from '../controller/getPermissionById.controller';
import { CreatePermissionController } from '../controller/createPermission.controller';
import { UpdatePermissionController } from '../controller/updatePermission.controller';
import { DeletePermissionController } from '../controller/deletePermission.controller';
import { GetPermissionsByRoleController } from '../controller/getPermissionsByRole.controller';
import { AssignPermissionsToRoleController } from '../controller/assignPermissionsToRole.controller';
import { RemovePermissionFromRoleController } from '../controller/removePermissionFromRole.controller';
import { GetRolesWithPermissionsController } from '../controller/getRolesWithPermissions.controller';

import { GetPermissionsService } from '../services/getPermissions.service';
import { GetPermissionByIdService } from '../services/getPermissionById.service';
import { CreatePermissionService } from '../services/createPermission.service';
import { UpdatePermissionService } from '../services/updatePermission.service';
import { DeletePermissionService } from '../services/deletePermission.service';
import { GetPermissionsByRoleService } from '../services/getPermissionsByRole.service';
import { AssignPermissionsToRoleService } from '../services/assignPermissionsToRole.service';
import { RemovePermissionFromRoleService } from '../services/removePermissionFromRole.service';
import { GetRolesWithPermissionsService } from '../services/getRolesWithPermissions.service';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

describe('Permission Controllers', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

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
    let controller: GetPermissionsController;
    let service: jest.Mocked<GetPermissionsService>;

    beforeEach(() => {
      service = new GetPermissionsService({} as any, {} as any) as jest.Mocked<GetPermissionsService>;
      controller = new GetPermissionsController(service);
    });

    it('doit retourner 200 avec pagination', async () => {
      const mockResult = { data: [{ id: '1', module: 'territory', action: 'read', description: null }], total: 1, page: 1, limit: 50, totalPages: 1 };
      service.getPermissions.mockResolvedValueOnce(mockResult);

      await controller.getPermissions(mockReq as Request, mockRes as Response, mockNext);

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

      await controller.getPermissions(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET PERMISSION BY ID
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetPermissionByIdController', () => {
    let controller: GetPermissionByIdController;
    let service: jest.Mocked<GetPermissionByIdService>;

    beforeEach(() => {
      service = new GetPermissionByIdService({} as any, {} as any) as jest.Mocked<GetPermissionByIdService>;
      controller = new GetPermissionByIdController(service);
    });

    it('doit retourner 200 avec la permission', async () => {
      mockReq.params = { id: VALID_UUID };
      const mockPerm = { id: VALID_UUID, module: 'territory', action: 'read', description: null };
      service.getPermissionById.mockResolvedValueOnce(mockPerm);

      await controller.getPermissionById(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getPermissionById).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockPerm }));
    });

    it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
      mockReq.params = { id: 'uuid-invalide' };

      await controller.getPermissionById(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.getPermissionById).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE PERMISSION
  // ─────────────────────────────────────────────────────────────────────────

  describe('CreatePermissionController', () => {
    let controller: CreatePermissionController;
    let service: jest.Mocked<CreatePermissionService>;

    beforeEach(() => {
      service = new CreatePermissionService({} as any, {} as any) as jest.Mocked<CreatePermissionService>;
      controller = new CreatePermissionController(service);
    });

    it('doit retourner 400 si module invalide (Zod)', async () => {
      mockReq.body = { module: 'invalide', action: 'read' };

      await controller.createPermission(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.createPermission).not.toHaveBeenCalled();
    });

    it('doit retourner 201 en cas de succès', async () => {
      mockReq.body = { module: 'territory', action: 'read' };
      const mockCreated = { id: 'new-uuid', module: 'territory', action: 'read', description: null };
      service.createPermission.mockResolvedValueOnce(mockCreated);

      await controller.createPermission(mockReq as Request, mockRes as Response, mockNext);

      expect(service.createPermission).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockCreated }));
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE PERMISSION
  // ─────────────────────────────────────────────────────────────────────────

  describe('UpdatePermissionController', () => {
    let controller: UpdatePermissionController;
    let service: jest.Mocked<UpdatePermissionService>;

    beforeEach(() => {
      service = new UpdatePermissionService({} as any, {} as any) as jest.Mocked<UpdatePermissionService>;
      controller = new UpdatePermissionController(service);
    });

    it('doit retourner 200 en cas de succès', async () => {
      mockReq.params = { id: VALID_UUID };
      mockReq.body = { description: 'New desc' };
      const mockUpdated = { id: VALID_UUID, module: 'territory', action: 'read', description: 'New desc' };
      service.updatePermission.mockResolvedValueOnce(mockUpdated);

      await controller.updatePermission(mockReq as Request, mockRes as Response, mockNext);

      expect(service.updatePermission).toHaveBeenCalledWith(VALID_UUID, mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
      mockReq.params = { id: 'uuid-invalide' };
      mockReq.body = { description: 'X' };

      await controller.updatePermission(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.updatePermission).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE PERMISSION
  // ─────────────────────────────────────────────────────────────────────────

  describe('DeletePermissionController', () => {
    let controller: DeletePermissionController;
    let service: jest.Mocked<DeletePermissionService>;

    beforeEach(() => {
      service = new DeletePermissionService({} as any, {} as any) as jest.Mocked<DeletePermissionService>;
      controller = new DeletePermissionController(service);
    });

    it('doit retourner 200 en cas de succès', async () => {
      mockReq.params = { id: VALID_UUID };
      service.deletePermission.mockResolvedValueOnce(undefined);

      await controller.deletePermission(mockReq as Request, mockRes as Response, mockNext);

      expect(service.deletePermission).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: null }));
    });

    it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
      mockReq.params = { id: 'uuid-invalide' };

      await controller.deletePermission(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.deletePermission).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET PERMISSIONS BY ROLE
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetPermissionsByRoleController', () => {
    let controller: GetPermissionsByRoleController;
    let service: jest.Mocked<GetPermissionsByRoleService>;

    beforeEach(() => {
      service = new GetPermissionsByRoleService({} as any, {} as any) as jest.Mocked<GetPermissionsByRoleService>;
      controller = new GetPermissionsByRoleController(service);
    });

    it('doit retourner 200 avec les permissions du rôle', async () => {
      mockReq.params = { roleId: VALID_UUID };
      const mockPerms = [{ id: '1', module: 'territory', action: 'read', description: null }];
      service.getPermissionsByRole.mockResolvedValueOnce(mockPerms);

      await controller.getPermissionsByRole(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getPermissionsByRole).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockPerms }));
    });

    it('doit retourner 400 si roleId invalide', async () => {
      mockReq.params = { roleId: 'uuid-invalide' };

      await controller.getPermissionsByRole(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.getPermissionsByRole).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ASSIGN PERMISSIONS TO ROLE
  // ─────────────────────────────────────────────────────────────────────────

  describe('AssignPermissionsToRoleController', () => {
    let controller: AssignPermissionsToRoleController;
    let service: jest.Mocked<AssignPermissionsToRoleService>;

    beforeEach(() => {
      service = new AssignPermissionsToRoleService({} as any, {} as any) as jest.Mocked<AssignPermissionsToRoleService>;
      controller = new AssignPermissionsToRoleController(service);
    });

    it('doit retourner 200 en cas de succès', async () => {
      mockReq.params = { roleId: VALID_UUID };
      mockReq.body = { permissionIds: [VALID_UUID] };
      const mockAssigned = [{ id: 'rp-1', roleId: VALID_UUID, permissionId: VALID_UUID }];
      service.assignPermissionsToRole.mockResolvedValueOnce(mockAssigned);

      await controller.assignPermissionsToRole(mockReq as Request, mockRes as Response, mockNext);

      expect(service.assignPermissionsToRole).toHaveBeenCalledWith(VALID_UUID, [VALID_UUID]);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockAssigned }));
    });

    it('doit retourner 400 si permissionIds invalides', async () => {
      mockReq.params = { roleId: VALID_UUID };
      mockReq.body = { permissionIds: ['uuid-invalide'] };

      await controller.assignPermissionsToRole(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.assignPermissionsToRole).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REMOVE PERMISSION FROM ROLE
  // ─────────────────────────────────────────────────────────────────────────

  describe('RemovePermissionFromRoleController', () => {
    let controller: RemovePermissionFromRoleController;
    let service: jest.Mocked<RemovePermissionFromRoleService>;

    beforeEach(() => {
      service = new RemovePermissionFromRoleService({} as any, {} as any) as jest.Mocked<RemovePermissionFromRoleService>;
      controller = new RemovePermissionFromRoleController(service);
    });

    it('doit retourner 200 en cas de succès', async () => {
      mockReq.params = { roleId: VALID_UUID, permissionId: VALID_UUID };
      service.removePermissionFromRole.mockResolvedValueOnce(undefined);

      await controller.removePermissionFromRole(mockReq as Request, mockRes as Response, mockNext);

      expect(service.removePermissionFromRole).toHaveBeenCalledWith(VALID_UUID, VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('doit retourner 400 si params invalides', async () => {
      mockReq.params = { roleId: 'uuid-invalide', permissionId: VALID_UUID };

      await controller.removePermissionFromRole(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.removePermissionFromRole).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET ROLES WITH PERMISSIONS
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetRolesWithPermissionsController', () => {
    let controller: GetRolesWithPermissionsController;
    let service: jest.Mocked<GetRolesWithPermissionsService>;

    beforeEach(() => {
      service = new GetRolesWithPermissionsService({} as any, {} as any) as jest.Mocked<GetRolesWithPermissionsService>;
      controller = new GetRolesWithPermissionsController(service);
    });

    it('doit retourner 200 avec les rôles', async () => {
      const mockRoles = [{ id: 'role-1', code: 'admin', name: 'Admin', tier: 'platform', canManageUsers: true, canManageRoles: true, permissions: [] }];
      service.getRolesWithPermissions.mockResolvedValueOnce(mockRoles);

      await controller.getRolesWithPermissions(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockRoles }));
    });

    it('doit passer l\'erreur à next() en cas d\'échec', async () => {
      const error = new Error('DB error');
      service.getRolesWithPermissions.mockRejectedValueOnce(error);

      await controller.getRolesWithPermissions(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});