import { Logger } from 'winston';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';
import { RoleRepository } from '../repositories/role.repositories';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

jest.mock('../repositories/role.repositories');

// Services
import { GetRolesService } from '../services/getRoles.service';
import { GetRoleByIdService } from '../services/getRoleById.service';
import { GetRoleByCodeService } from '../services/getRoleByCode.service';
import { CreateRoleService } from '../services/createRole.service';
import { UpdateRoleService } from '../services/updateRole.service';
import { DeleteRoleService } from '../services/deleteRole.service';

describe('Role Services', () => {
  let roleRepository: jest.Mocked<RoleRepository>;

  beforeEach(() => {
    roleRepository = new RoleRepository({} as any, mockLogger) as jest.Mocked<RoleRepository>;
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET ROLES
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetRolesService', () => {
    let service: GetRolesService;

    beforeEach(() => {
      service = new GetRolesService(roleRepository, mockLogger);
    });

    it('doit retourner une liste paginée', async () => {
      const mockResult = {
        data: [{ id: '1', code: 'admin', name: 'Admin', description: null, tier: 'platform', routePrefix: null, dashboardPath: null, pageIds: [], canManageUsers: true, canManageRoles: false, createdAt: new Date(), updatedAt: new Date() }],
        total: 1, page: 1, limit: 50, totalPages: 1,
      };
      roleRepository.getAllRoles.mockResolvedValueOnce(mockResult as any);

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
    let service: GetRoleByIdService;

    beforeEach(() => {
      service = new GetRoleByIdService(roleRepository, mockLogger);
    });

    it('doit retourner le rôle si trouvé', async () => {
      const mockRole = { id: '1', code: 'admin', name: 'Admin' };
      roleRepository.getRoleById.mockResolvedValueOnce(mockRole as any);

      const result = await service.getRoleById('1');

      expect(result).toEqual(mockRole);
    });

    it('doit lever NotFoundError si inexistant', async () => {
      roleRepository.getRoleById.mockResolvedValueOnce(null);

      await expect(service.getRoleById('uuid-inexistant')).rejects.toThrow(NotFoundError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET ROLE BY CODE
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetRoleByCodeService', () => {
    let service: GetRoleByCodeService;

    beforeEach(() => {
      service = new GetRoleByCodeService(roleRepository, mockLogger);
    });

    it('doit retourner le rôle si trouvé', async () => {
      const mockRole = { id: '1', code: 'super_admin', name: 'Super Admin' };
      roleRepository.getRoleByCode.mockResolvedValueOnce(mockRole as any);

      const result = await service.getRoleByCode('super_admin');

      expect(result).toEqual(mockRole);
    });

    it('doit lever NotFoundError si code inexistant', async () => {
      roleRepository.getRoleByCode.mockResolvedValueOnce(null);

      await expect(service.getRoleByCode('inexistant')).rejects.toThrow(NotFoundError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE ROLE
  // ─────────────────────────────────────────────────────────────────────────

  describe('CreateRoleService', () => {
    let service: CreateRoleService;

    beforeEach(() => {
      service = new CreateRoleService(roleRepository, mockLogger);
    });

    it('doit créer un rôle avec code en minuscule', async () => {
      roleRepository.getRoleByCode.mockResolvedValueOnce(null);
      const mockCreated = { id: 'new-uuid', code: 'admin', name: 'Admin' };
      roleRepository.createRole.mockResolvedValueOnce(mockCreated as any);

      const result = await service.createRole({ code: 'ADMIN', name: 'Admin' });

      expect(result.code).toBe('admin');
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('doit lever BadRequestError si code vide', async () => {
      await expect(service.createRole({ code: '   ', name: 'X' }))
        .rejects.toThrow(BadRequestError);
    });

    it('doit lever BadRequestError si code déjà existant', async () => {
      roleRepository.getRoleByCode.mockResolvedValueOnce({ id: '1', code: 'admin', name: 'Admin' } as any);

      await expect(service.createRole({ code: 'admin', name: 'Admin' }))
        .rejects.toThrow(BadRequestError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE ROLE
  // ─────────────────────────────────────────────────────────────────────────

  describe('UpdateRoleService', () => {
    let service: UpdateRoleService;

    beforeEach(() => {
      service = new UpdateRoleService(roleRepository, mockLogger);
    });

    it('doit mettre à jour le rôle', async () => {
      const mockUpdated = { id: '1', code: 'admin', name: 'New Name' };
      roleRepository.updateRole.mockResolvedValueOnce(mockUpdated as any);

      const result = await service.updateRole('1', { name: 'New Name' });

      expect(result).toEqual(mockUpdated);
    });

    it('doit lever NotFoundError si inexistant', async () => {
      roleRepository.updateRole.mockResolvedValueOnce(null);

      await expect(service.updateRole('uuid-inexistant', { name: 'X' }))
        .rejects.toThrow(NotFoundError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE ROLE
  // ─────────────────────────────────────────────────────────────────────────

  describe('DeleteRoleService', () => {
    let service: DeleteRoleService;

    beforeEach(() => {
      service = new DeleteRoleService(roleRepository, mockLogger);
    });

    it('doit supprimer le rôle', async () => {
      roleRepository.deleteRole.mockResolvedValueOnce(undefined);

      await service.deleteRole('1');

      expect(roleRepository.deleteRole).toHaveBeenCalledWith('1');
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('doit propager BadRequestError si utilisateurs rattachés', async () => {
      const error = new BadRequestError('Utilisateurs rattachés');
      roleRepository.deleteRole.mockRejectedValueOnce(error);

      await expect(service.deleteRole('1')).rejects.toThrow(BadRequestError);
    });

    it('doit propager NotFoundError', async () => {
      const error = new NotFoundError('Rôle introuvable');
      roleRepository.deleteRole.mockRejectedValueOnce(error);

      await expect(service.deleteRole('1')).rejects.toThrow(NotFoundError);
    });
  });
});