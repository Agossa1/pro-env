import { Logger } from 'winston';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';
import { TerritoryRepository } from '../repositories/territory.repositories';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

jest.mock('../repositories/territory.repositories');

// Services
import { GetTerritoryTypesService } from '../services/getTerritoryTypes.service';
import { GetTerritoryTypeByCodeService } from '../services/getTerritoryTypeByCode.service';
import { GetTerritoryTypeByIdService } from '../services/getTerritoryTypeById.service';
import { CreateTerritoryTypeService } from '../services/createTerritoryType.service';
import { UpdateTerritoryTypeService } from '../services/updateTerritoryType.service';
import { DeleteTerritoryTypeService } from '../services/deleteTerritoryType.service';
import { GetAllTerritoriesService } from '../services/getAllTerritories.service';
import { GetTerritoryByIdService } from '../services/getTerritoryById.service';
import { GetTerritoryByCodeService } from '../services/getTerritoryByCode.service';
import { CreateTerritoryService } from '../services/createTerritory.service';

describe('Territory Services', () => {
  let territoryRepository: jest.Mocked<TerritoryRepository>;

  beforeEach(() => {
    territoryRepository = new TerritoryRepository({} as any, mockLogger) as jest.Mocked<TerritoryRepository>;
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TERRITORY TYPES SERVICES
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetTerritoryTypesService', () => {
    let service: GetTerritoryTypesService;

    beforeEach(() => {
      service = new GetTerritoryTypesService(territoryRepository, mockLogger);
    });

    it('doit retourner une liste paginée', async () => {
      const mockResult = { data: [{ id: '1', code: 'DEP', name: 'Dep', hierarchyLevel: 1 }], total: 1, page: 1, limit: 50, totalPages: 1 };
      territoryRepository.getAllTerritoryTypes.mockResolvedValueOnce(mockResult);

      const result = await service.getTerritoryTypes({ page: 1, limit: 50 });

      expect(result).toEqual(mockResult);
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('doit logger et propager l\'erreur', async () => {
      const error = new Error('DB error');
      territoryRepository.getAllTerritoryTypes.mockRejectedValueOnce(error);

      await expect(service.getTerritoryTypes()).rejects.toThrow('DB error');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('GetTerritoryTypeByCodeService', () => {
    let service: GetTerritoryTypeByCodeService;

    beforeEach(() => {
      service = new GetTerritoryTypeByCodeService(territoryRepository, mockLogger);
    });

    it('doit retourner le type si trouvé', async () => {
      const mockType = { id: '1', code: 'DEPARTMENT', name: 'Department', hierarchyLevel: 1 };
      territoryRepository.getTerritoryTypeByCode.mockResolvedValueOnce(mockType);

      const result = await service.getTerritoryTypeByCode('DEPARTMENT');

      expect(result).toEqual(mockType);
    });

    it('doit lever NotFoundError si type inexistant', async () => {
      territoryRepository.getTerritoryTypeByCode.mockResolvedValueOnce(null);

      await expect(service.getTerritoryTypeByCode('INEXISTANT')).rejects.toThrow(NotFoundError);
    });
  });

  describe('GetTerritoryTypeByIdService', () => {
    let service: GetTerritoryTypeByIdService;

    beforeEach(() => {
      service = new GetTerritoryTypeByIdService(territoryRepository, mockLogger);
    });

    it('doit retourner le type si trouvé', async () => {
      const mockType = { id: 'uuid-1', code: 'DEP', name: 'Dep', hierarchyLevel: 1 };
      territoryRepository.getTerritoryTypeById.mockResolvedValueOnce(mockType);

      const result = await service.getTerritoryTypeById('uuid-1');

      expect(result).toEqual(mockType);
    });

    it('doit lever NotFoundError si type inexistant', async () => {
      territoryRepository.getTerritoryTypeById.mockResolvedValueOnce(null);

      await expect(service.getTerritoryTypeById('uuid-inexistant')).rejects.toThrow(NotFoundError);
    });
  });

  describe('CreateTerritoryTypeService', () => {
    let service: CreateTerritoryTypeService;

    beforeEach(() => {
      service = new CreateTerritoryTypeService(territoryRepository, mockLogger);
    });

    it('doit créer un type après validation', async () => {
      territoryRepository.getTerritoryTypeByCode.mockResolvedValueOnce(null);
      const mockCreated = { id: 'new-uuid', code: 'PROVINCE', name: 'Province', hierarchyLevel: 2 };
      territoryRepository.createTerritoryType.mockResolvedValueOnce(mockCreated);

      const result = await service.createTerritoryType({ code: 'province', name: 'Province', hierarchyLevel: 2 });

      expect(result.code).toBe('PROVINCE');
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('doit lever BadRequestError si code vide', async () => {
      await expect(service.createTerritoryType({ code: '   ', name: 'X', hierarchyLevel: 1 }))
        .rejects.toThrow(BadRequestError);
    });

    it('doit lever BadRequestError si code déjà existant', async () => {
      territoryRepository.getTerritoryTypeByCode.mockResolvedValueOnce({ id: '1', code: 'DEP', name: 'Dep', hierarchyLevel: 1 });

      await expect(service.createTerritoryType({ code: 'DEP', name: 'Dep', hierarchyLevel: 1 }))
        .rejects.toThrow(BadRequestError);
    });
  });

  describe('UpdateTerritoryTypeService', () => {
    let service: UpdateTerritoryTypeService;

    beforeEach(() => {
      service = new UpdateTerritoryTypeService(territoryRepository, mockLogger);
    });

    it('doit mettre à jour le type', async () => {
      const mockUpdated = { id: 'uuid-1', code: 'DEP', name: 'New Name', hierarchyLevel: 2 };
      territoryRepository.updateTerritoryType.mockResolvedValueOnce(mockUpdated);

      const result = await service.updateTerritoryType('uuid-1', { name: 'New Name' });

      expect(result).toEqual(mockUpdated);
    });

    it('doit lever NotFoundError si type inexistant', async () => {
      territoryRepository.updateTerritoryType.mockResolvedValueOnce(null);

      await expect(service.updateTerritoryType('uuid-inexistant', { name: 'X' }))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('DeleteTerritoryTypeService', () => {
    let service: DeleteTerritoryTypeService;

    beforeEach(() => {
      service = new DeleteTerritoryTypeService(territoryRepository, mockLogger);
    });

    it('doit supprimer le type', async () => {
      territoryRepository.deleteTerritoryType.mockResolvedValueOnce(undefined);

      await service.deleteTerritoryType('uuid-1');

      expect(territoryRepository.deleteTerritoryType).toHaveBeenCalledWith('uuid-1');
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('doit propager l\'erreur du repository', async () => {
      const error = new NotFoundError('Type introuvable');
      territoryRepository.deleteTerritoryType.mockRejectedValueOnce(error);

      await expect(service.deleteTerritoryType('uuid-1')).rejects.toThrow(NotFoundError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TERRITORIES SERVICES
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetAllTerritoriesService', () => {
    let service: GetAllTerritoriesService;

    beforeEach(() => {
      service = new GetAllTerritoriesService(territoryRepository, mockLogger);
    });

    it('doit retourner une liste paginée avec filtres', async () => {
      const mockResult = { data: [{ id: '1', name: 'Cotonou' }], total: 1, page: 1, limit: 50, totalPages: 1 };
      territoryRepository.getAllTerritories.mockResolvedValueOnce(mockResult as any);

      const result = await service.getAllTerritories({ territoryTypeId: 'type-uuid' });

      expect(result).toEqual(mockResult);
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('GetTerritoryByIdService', () => {
    let service: GetTerritoryByIdService;

    beforeEach(() => {
      service = new GetTerritoryByIdService(territoryRepository, mockLogger);
    });

    it('doit retourner le territoire', async () => {
      const mockTerr = { id: 'uuid-t', name: 'Cotonou' };
      territoryRepository.getTerritoryById.mockResolvedValueOnce(mockTerr as any);

      const result = await service.getTerritoryById('uuid-t');

      expect(result).toEqual(mockTerr);
    });

    it('doit lever NotFoundError si inexistant', async () => {
      territoryRepository.getTerritoryById.mockResolvedValueOnce(null);

      await expect(service.getTerritoryById('uuid-inexistant')).rejects.toThrow(NotFoundError);
    });
  });

  describe('GetTerritoryByCodeService', () => {
    let service: GetTerritoryByCodeService;

    beforeEach(() => {
      service = new GetTerritoryByCodeService(territoryRepository, mockLogger);
    });

    it('doit retourner le territoire par code', async () => {
      const mockTerr = { id: 'uuid-t', code: 'BJ-LI-CO', name: 'Cotonou' };
      territoryRepository.getTerritoryByCode.mockResolvedValueOnce(mockTerr as any);

      const result = await service.getTerritoryByCode('BJ-LI-CO');

      expect(result).toEqual(mockTerr);
    });

    it('doit lever NotFoundError si code inexistant', async () => {
      territoryRepository.getTerritoryByCode.mockResolvedValueOnce(null);

      await expect(service.getTerritoryByCode('INEXISTANT')).rejects.toThrow(NotFoundError);
    });
  });

  describe('CreateTerritoryService', () => {
    let service: CreateTerritoryService;

    beforeEach(() => {
      service = new CreateTerritoryService(territoryRepository, mockLogger);
    });

    const validDto = {
      territoryTypeId: 'type-uuid',
      name: 'Test Territory',
      code: 'BJ-TEST',
      geometry: { type: 'MultiPolygon', coordinates: [] },
    };

    it('doit lever BadRequestError si territoryTypeId absent', async () => {
      await expect(service.createTerritory({ name: 'X', code: 'BJ-X' } as any))
        .rejects.toThrow(BadRequestError);
    });

    it('doit lever BadRequestError si type de territoire introuvable', async () => {
      territoryRepository.getTerritoryTypeById.mockResolvedValueOnce(null);

      await expect(service.createTerritory(validDto))
        .rejects.toThrow(BadRequestError);
    });

    it('doit lever BadRequestError si code déjà existant', async () => {
      territoryRepository.getTerritoryTypeById.mockResolvedValueOnce({ id: 'type-uuid', code: 'DEP', name: 'Dep', hierarchyLevel: 1 });
      territoryRepository.existsTerritoryByCode.mockResolvedValueOnce(true);

      await expect(service.createTerritory(validDto))
        .rejects.toThrow(BadRequestError);
    });

    it('doit lever BadRequestError si parent supprimé', async () => {
      territoryRepository.getTerritoryTypeById.mockResolvedValueOnce({ id: 'type-uuid', code: 'DEP', name: 'Dep', hierarchyLevel: 1 });
      territoryRepository.existsTerritoryByCode.mockResolvedValueOnce(false);
      territoryRepository.getTerritoryById.mockResolvedValueOnce({ id: 'parent-uuid', territoryTypeId: 'type-parent', name: 'Parent', deletedAt: new Date() } as any);

      await expect(service.createTerritory({ ...validDto, parentTerritoryId: 'parent-uuid' }))
        .rejects.toThrow(BadRequestError);
    });

    it('doit lever BadRequestError si géométrie absente', async () => {
      territoryRepository.getTerritoryTypeById.mockResolvedValueOnce({ id: 'type-uuid', code: 'DEP', name: 'Dep', hierarchyLevel: 1 });
      territoryRepository.existsTerritoryByCode.mockResolvedValueOnce(false);

      await expect(service.createTerritory({ ...validDto, geometry: undefined }))
        .rejects.toThrow(BadRequestError);
    });

    it('doit créer le territoire avec succès', async () => {
      territoryRepository.getTerritoryTypeById.mockResolvedValueOnce({ id: 'type-uuid', code: 'DEP', name: 'Dep', hierarchyLevel: 1 });
      territoryRepository.existsTerritoryByCode.mockResolvedValueOnce(false);
      const mockCreated = { id: 'new-uuid', name: 'Test Territory', code: 'BJ-TEST' };
      territoryRepository.createTerritory.mockResolvedValueOnce(mockCreated as any);

      const result = await service.createTerritory(validDto, 'creator-uuid');

      expect(result).toEqual(mockCreated);
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });
});