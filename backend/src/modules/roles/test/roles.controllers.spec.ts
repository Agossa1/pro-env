import type { Request, Response, NextFunction } from 'express';

// Mock des services
jest.mock('../services/getRoles.service');
jest.mock('../services/getRoleById.service');
jest.mock('../services/getRoleByCode.service');
jest.mock('../services/createRole.service');
jest.mock('../services/updateRole.service');
jest.mock('../services/deleteRole.service');

// Imports après les mocks
import { GetRolesController } from '../controller/getRoles.controller';
import { GetRoleByIdController } from '../controller/getRoleById.controller';
import { GetRoleByCodeController } from '../controller/getRoleByCode.controller';
import { CreateRoleController } from '../controller/createRole.controller';
import { UpdateRoleController } from '../controller/updateRole.controller';
import { DeleteRoleController } from '../controller/deleteRole.controller';

import { GetRolesService } from '../services/getRoles.service';
import { GetRoleByIdService } from '../services/getRoleById.service';
import { GetRoleByCodeService } from '../services/getRoleByCode.service';
import { CreateRoleService } from '../services/createRole.service';
import { UpdateRoleService } from '../services/updateRole.service';
import { DeleteRoleService } from '../services/deleteRole.service';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

describe('Role Controllers', () => {
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
  // GET ROLES
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetRolesController', () => {
    let controller: GetRolesController;
    let service: jest.Mocked<GetRolesService>;

    beforeEach(() => {
      service = new GetRolesService({} as any, {} as any) as jest.Mocked<GetRolesService>;
      controller = new GetRolesController(service);
    });

    it('doit retourner 200 avec pagination', async () => {
      const mockResult = {
        data: [{ id: '1', code: 'admin', name: 'Admin' }],
        total: 1, page: 1, limit: 50, totalPages: 1,
      };
      service.getRoles.mockResolvedValueOnce(mockResult as any);

      await controller.getRoles(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        pagination: { total: 1, page: 1, limit: 50, totalPages: 1 },
      }));
    });

    it('doit passer l\'erreur à next() si le service échoue', async () => {
      const error = new Error('Service error');
      service.getRoles.mockRejectedValueOnce(error);

      await controller.getRoles(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET ROLE BY ID
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetRoleByIdController', () => {
    let controller: GetRoleByIdController;
    let service: jest.Mocked<GetRoleByIdService>;

    beforeEach(() => {
      service = new GetRoleByIdService({} as any, {} as any) as jest.Mocked<GetRoleByIdService>;
      controller = new GetRoleByIdController(service);
    });

    it('doit retourner 200 avec le rôle', async () => {
      mockReq.params = { id: VALID_UUID };
      const mockRole = { id: VALID_UUID, code: 'admin', name: 'Admin' };
      service.getRoleById.mockResolvedValueOnce(mockRole as any);

      await controller.getRoleById(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getRoleById).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockRole }));
    });

    it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
      mockReq.params = { id: 'uuid-invalide' };

      await controller.getRoleById(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.getRoleById).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET ROLE BY CODE
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetRoleByCodeController', () => {
    let controller: GetRoleByCodeController;
    let service: jest.Mocked<GetRoleByCodeService>;

    beforeEach(() => {
      service = new GetRoleByCodeService({} as any, {} as any) as jest.Mocked<GetRoleByCodeService>;
      controller = new GetRoleByCodeController(service);
    });

    it('doit retourner 200 avec le rôle', async () => {
      mockReq.params = { code: 'super_admin' };
      const mockRole = { id: '1', code: 'super_admin', name: 'Super Admin' };
      service.getRoleByCode.mockResolvedValueOnce(mockRole as any);

      await controller.getRoleByCode(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getRoleByCode).toHaveBeenCalledWith('super_admin');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockRole }));
    });

    it('doit retourner 400 si le code est vide', async () => {
      mockReq.params = { code: '' };

      await controller.getRoleByCode(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.getRoleByCode).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE ROLE
  // ─────────────────────────────────────────────────────────────────────────

  describe('CreateRoleController', () => {
    let controller: CreateRoleController;
    let service: jest.Mocked<CreateRoleService>;

    beforeEach(() => {
      service = new CreateRoleService({} as any, {} as any) as jest.Mocked<CreateRoleService>;
      controller = new CreateRoleController(service);
    });

    it('doit retourner 400 si validation Zod échoue', async () => {
      mockReq.body = { code: '', name: '' };

      await controller.createRole(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.createRole).not.toHaveBeenCalled();
    });

    it('doit retourner 201 en cas de succès', async () => {
      mockReq.body = { code: 'admin', name: 'Admin' };
      const mockCreated = { id: 'new-uuid', code: 'admin', name: 'Admin' };
      service.createRole.mockResolvedValueOnce(mockCreated as any);

      await controller.createRole(mockReq as Request, mockRes as Response, mockNext);

      expect(service.createRole).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockCreated }));
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE ROLE
  // ─────────────────────────────────────────────────────────────────────────

  describe('UpdateRoleController', () => {
    let controller: UpdateRoleController;
    let service: jest.Mocked<UpdateRoleService>;

    beforeEach(() => {
      service = new UpdateRoleService({} as any, {} as any) as jest.Mocked<UpdateRoleService>;
      controller = new UpdateRoleController(service);
    });

    it('doit retourner 200 en cas de succès', async () => {
      mockReq.params = { id: VALID_UUID };
      mockReq.body = { name: 'New Name' };
      const mockUpdated = { id: VALID_UUID, code: 'admin', name: 'New Name' };
      service.updateRole.mockResolvedValueOnce(mockUpdated as any);

      await controller.updateRole(mockReq as Request, mockRes as Response, mockNext);

      expect(service.updateRole).toHaveBeenCalledWith(VALID_UUID, mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockUpdated }));
    });

    it('doit retourner 400 si l\'id invalide', async () => {
      mockReq.params = { id: 'uuid-invalide' };
      mockReq.body = { name: 'X' };

      await controller.updateRole(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.updateRole).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE ROLE
  // ─────────────────────────────────────────────────────────────────────────

  describe('DeleteRoleController', () => {
    let controller: DeleteRoleController;
    let service: jest.Mocked<DeleteRoleService>;

    beforeEach(() => {
      service = new DeleteRoleService({} as any, {} as any) as jest.Mocked<DeleteRoleService>;
      controller = new DeleteRoleController(service);
    });

    it('doit retourner 200 en cas de succès', async () => {
      mockReq.params = { id: VALID_UUID };
      service.deleteRole.mockResolvedValueOnce(undefined);

      await controller.deleteRole(mockReq as Request, mockRes as Response, mockNext);

      expect(service.deleteRole).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: null }));
    });

    it('doit retourner 400 si l\'id invalide', async () => {
      mockReq.params = { id: 'uuid-invalide' };

      await controller.deleteRole(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.deleteRole).not.toHaveBeenCalled();
    });
  });
});