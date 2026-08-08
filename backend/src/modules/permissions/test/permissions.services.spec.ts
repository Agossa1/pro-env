import { Logger } from 'winston';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';
import { PermissionRepository } from '../repositories/permission.repositories';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

jest.mock('../repositories/permission.repositories');

// Services
import { GetPermissionsService } from '../services/getPermissions.service';
import { GetPermissionByIdService } from '../services/getPermissionById.service';
import { CreatePermissionService } from '../services/createPermission.service';
import { UpdatePermissionService } from '../services/updatePermission.service';
import { DeletePermissionService } from '../services/deletePermission.service';
import { GetPermissionsByRoleService } from '../services/getPermissionsByRole.service';
import { AssignPermissionsToRoleService } from '../services/assignPermissionsToRole.service';
import { RemovePermissionFromRoleService } from '../services/removePermissionFromRole.service';
import { GetRolesWithPermissionsService } from '../services/getRolesWithPermissions.service';

describe('Permission Services', () => {
  let permissionRepository: jest.Mocked<PermissionRepository>;

  beforeEach(() => {
    permissionRepository = new PermissionRepository({} as any, mockLogger) as jest.Mocked<PermissionRepository>;
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET PERMISSIONS
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetPermissionsService', () => {
    let service: GetPermissionsService;

    beforeEach(() => {
      service = new GetPermissionsService(permissionRepository, mockLogger);
    });

    it('doit retourner une liste paginée', async () => {
      const mockResult = {
        data: [{ id: '1', module: 'territory', action: 'read', description: null }],
        total: 1, page: 1, limit: 50, totalPages: 1,
      };
      permissionRepository.getAllPermissions.mockResolvedValueOnce(mockResult);

      const result = await service.getPermissions({ page: 1, limit: 50 });

      expect(result).toEqual(mockResult);
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('doit logger et propager l\'erreur', async () => {
      const error = new Error('DB error');
      permissionRepository.getAllPermissions.mockRejectedValueOnce(error);

      await expect(service.getPermissions()).rejects.toThrow('DB error');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET PERMISSION BY ID
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetPermissionByIdService', () => {
    let service: GetPermissionByIdService;

    beforeEach(() => {
      service = new GetPermissionByIdService(permissionRepository, mockLogger);
    });

    it('doit retourner la permission si trouvée', async () => {
      const mockPerm = { id: '1', module: 'territory', action: 'read', description: null };
      permissionRepository.getPermissionById.mockResolvedValueOnce(mockPerm);

      const result = await service.getPermissionById('1');

      expect(result).toEqual(mockPerm);
    });

    it('doit lever NotFoundError si inexistante', async () => {
      permissionRepository.getPermissionById.mockResolvedValueOnce(null);

      await expect(service.getPermissionById('uuid-inexistant')).rejects.toThrow(NotFoundError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE PERMISSION
  // ─────────────────────────────────────────────────────────────────────────

  describe('CreatePermissionService', () => {
    let service: CreatePermissionService;

    beforeEach(() => {
      service = new CreatePermissionService(permissionRepository, mockLogger);
    });

    it('doit créer une permission (module/action en minuscule)', async () => {
      permissionRepository.getPermissionByModuleAction.mockResolvedValueOnce(null);
      const mockCreated = { id: 'new-uuid', module: 'territory', action: 'read', description: null };
      permissionRepository.createPermission.mockResolvedValueOnce(mockCreated);

      const result = await service.createPermission({ module: 'TERRITORY', action: 'READ' });

      expect(result.module).toBe('territory');
      expect(result.action).toBe('read');
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('doit lever BadRequestError si module/action vide', async () => {
      await expect(service.createPermission({ module: '   ', action: '  ' }))
        .rejects.toThrow(BadRequestError);
    });

    it('doit lever BadRequestError si doublon (module, action)', async () => {
      permissionRepository.getPermissionByModuleAction.mockResolvedValueOnce({
        id: '1', module: 'territory', action: 'read', description: null,
      });

      await expect(service.createPermission({ module: 'territory', action: 'read' }))
        .rejects.toThrow(BadRequestError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE PERMISSION
  // ─────────────────────────────────────────────────────────────────────────

  describe('UpdatePermissionService', () => {
    let service: UpdatePermissionService;

    beforeEach(() => {
      service = new UpdatePermissionService(permissionRepository, mockLogger);
    });

    it('doit mettre à jour la permission', async () => {
      const mockUpdated = { id: 'uuid-1', module: 'territory', action: 'read', description: 'New' };
      permissionRepository.updatePermission.mockResolvedValueOnce(mockUpdated);

      const result = await service.updatePermission('uuid-1', { description: 'New' });

      expect(result).toEqual(mockUpdated);
    });

    it('doit lever NotFoundError si inexistante', async () => {
      permissionRepository.updatePermission.mockResolvedValueOnce(null);

      await expect(service.updatePermission('uuid-inexistant', { description: 'X' }))
        .rejects.toThrow(NotFoundError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE PERMISSION
  // ─────────────────────────────────────────────────────────────────────────

  describe('DeletePermissionService', () => {
    let service: DeletePermissionService;

    beforeEach(() => {
      service = new DeletePermissionService(permissionRepository, mockLogger);
    });

    it('doit supprimer la permission', async () => {
      permissionRepository.deletePermission.mockResolvedValueOnce(undefined);

      await service.deletePermission('uuid-1');

      expect(permissionRepository.deletePermission).toHaveBeenCalledWith('uuid-1');
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('doit propager l\'erreur du repository', async () => {
      const error = new NotFoundError('Permission introuvable');
      permissionRepository.deletePermission.mockRejectedValueOnce(error);

      await expect(service.deletePermission('uuid-1')).rejects.toThrow(NotFoundError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET PERMISSIONS BY ROLE
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetPermissionsByRoleService', () => {
    let service: GetPermissionsByRoleService;

    beforeEach(() => {
      service = new GetPermissionsByRoleService(permissionRepository, mockLogger);
    });

    it('doit retourner les permissions du rôle', async () => {
      const mockPerms = [{ id: '1', module: 'territory', action: 'read', description: null }];
      permissionRepository.getPermissionsByRoleId.mockResolvedValueOnce(mockPerms);

      const result = await service.getPermissionsByRole('role-uuid');

      expect(result).toEqual(mockPerms);
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ASSIGN PERMISSIONS TO ROLE
  // ─────────────────────────────────────────────────────────────────────────

  describe('AssignPermissionsToRoleService', () => {
    let service: AssignPermissionsToRoleService;

    beforeEach(() => {
      service = new AssignPermissionsToRoleService(permissionRepository, mockLogger);
    });

    it('doit lever BadRequestError si liste vide', async () => {
      await expect(service.assignPermissionsToRole('role-uuid', []))
        .rejects.toThrow(BadRequestError);
    });

    it('doit assigner et dédupliquer les permissions', async () => {
      const mockAssigned = [{ id: 'rp-1', roleId: 'role-uuid', permissionId: 'perm-1' }];
      permissionRepository.assignPermissionsToRole.mockResolvedValueOnce(mockAssigned);

      const result = await service.assignPermissionsToRole('role-uuid', ['perm-1', 'perm-1']);

      expect(permissionRepository.assignPermissionsToRole).toHaveBeenCalledWith('role-uuid', ['perm-1']);
      expect(result).toEqual(mockAssigned);
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REMOVE PERMISSION FROM ROLE
  // ─────────────────────────────────────────────────────────────────────────

  describe('RemovePermissionFromRoleService', () => {
    let service: RemovePermissionFromRoleService;

    beforeEach(() => {
      service = new RemovePermissionFromRoleService(permissionRepository, mockLogger);
    });

    it('doit retirer la permission du rôle', async () => {
      permissionRepository.removePermissionFromRole.mockResolvedValueOnce(undefined);

      await service.removePermissionFromRole('role-uuid', 'perm-1');

      expect(permissionRepository.removePermissionFromRole).toHaveBeenCalledWith('role-uuid', 'perm-1');
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('doit propager NotFoundError', async () => {
      const error = new NotFoundError('Non assignée');
      permissionRepository.removePermissionFromRole.mockRejectedValueOnce(error);

      await expect(service.removePermissionFromRole('role-uuid', 'perm-1'))
        .rejects.toThrow(NotFoundError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET ROLES WITH PERMISSIONS
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetRolesWithPermissionsService', () => {
    let service: GetRolesWithPermissionsService;

    beforeEach(() => {
      service = new GetRolesWithPermissionsService(permissionRepository, mockLogger);
    });

    it('doit retourner les rôles avec permissions', async () => {
      const mockRoles = [{ id: 'role-1', code: 'admin', name: 'Admin', tier: 'platform', canManageUsers: true, canManageRoles: true, permissions: [] }];
      permissionRepository.getRolesWithPermissions.mockResolvedValueOnce(mockRoles);

      const result = await service.getRolesWithPermissions();

      expect(result).toEqual(mockRoles);
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });
});