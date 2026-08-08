import type { Request, Response, NextFunction } from 'express';

// Mock des services
jest.mock('../services/getTerritoryTypes.service');
jest.mock('../services/getTerritoryTypeByCode.service');
jest.mock('../services/getTerritoryTypeById.service');
jest.mock('../services/createTerritoryType.service');
jest.mock('../services/updateTerritoryType.service');
jest.mock('../services/deleteTerritoryType.service');
jest.mock('../services/getAllTerritories.service');
jest.mock('../services/getTerritoryById.service');
jest.mock('../services/getTerritoryByCode.service');
jest.mock('../services/createTerritory.service');

// Imports après les mocks
import { GetTerritoryTypesController } from '../controller/getTerritoryTypes.controller';
import { GetTerritoryTypeByCodeController } from '../controller/getTerritoryTypeByCode.controller';
import { GetTerritoryTypeByIdController } from '../controller/getTerritoryTypeById.controller';
import { CreateTerritoryTypeController } from '../controller/createTerritoryType.controller';
import { UpdateTerritoryTypeController } from '../controller/updateTerritoryType.controller';
import { DeleteTerritoryTypeController } from '../controller/deleteTerritoryType.controller';
import { GetAllTerritoriesController } from '../controller/getAllTerritories.controller';
import { GetTerritoryByIdController } from '../controller/getTerritoryById.controller';
import { GetTerritoryByCodeController } from '../controller/getTerritoryByCode.controller';
import { CreateTerritoryController } from '../controller/createTerritory.controller';

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

describe('Territory Controllers', () => {
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
  // GET TERRITORY TYPES
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetTerritoryTypesController', () => {
    let controller: GetTerritoryTypesController;
    let service: jest.Mocked<GetTerritoryTypesService>;

    beforeEach(() => {
      service = new GetTerritoryTypesService({} as any, {} as any) as jest.Mocked<GetTerritoryTypesService>;
      controller = new GetTerritoryTypesController(service);
    });

    it('doit retourner 200 avec pagination', async () => {
      const mockResult = { data: [{ id: '1', code: 'DEP', name: 'Dep', hierarchyLevel: 1 }], total: 1, page: 1, limit: 50, totalPages: 1 };
      service.getTerritoryTypes.mockResolvedValueOnce(mockResult);

      await controller.getTerritoryTypes(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: mockResult.data,
        pagination: { total: 1, page: 1, limit: 50, totalPages: 1 },
      }));
    });

    it('doit parser les query params de pagination', async () => {
      mockReq.query = { page: '2', limit: '10' };
      service.getTerritoryTypes.mockResolvedValueOnce({ data: [], total: 0, page: 2, limit: 10, totalPages: 0 });

      await controller.getTerritoryTypes(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getTerritoryTypes).toHaveBeenCalledWith({ page: 2, limit: 10 });
    });

    it('doit passer l\'erreur à next() si le service échoue', async () => {
      const error = new Error('Service error');
      service.getTerritoryTypes.mockRejectedValueOnce(error);

      await controller.getTerritoryTypes(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET TERRITORY TYPE BY CODE
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetTerritoryTypeByCodeController', () => {
    let controller: GetTerritoryTypeByCodeController;
    let service: jest.Mocked<GetTerritoryTypeByCodeService>;

    beforeEach(() => {
      service = new GetTerritoryTypeByCodeService({} as any, {} as any) as jest.Mocked<GetTerritoryTypeByCodeService>;
      controller = new GetTerritoryTypeByCodeController(service);
    });

    it('doit retourner 200 avec le type', async () => {
      mockReq.params = { code: 'DEPARTMENT' };
      const mockType = { id: '1', code: 'DEPARTMENT', name: 'Department', hierarchyLevel: 1 };
      service.getTerritoryTypeByCode.mockResolvedValueOnce(mockType);

      await controller.getTerritoryTypeByCode(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getTerritoryTypeByCode).toHaveBeenCalledWith('DEPARTMENT');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockType }));
    });

    it('doit retourner 400 si le code est vide', async () => {
      mockReq.params = { code: '' };

      await controller.getTerritoryTypeByCode(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.getTerritoryTypeByCode).not.toHaveBeenCalled();
    });

    it('doit passer l\'erreur à next() si le service échoue', async () => {
      mockReq.params = { code: 'INEXISTANT' };
      const error = new Error('Not found');
      service.getTerritoryTypeByCode.mockRejectedValueOnce(error);

      await controller.getTerritoryTypeByCode(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET TERRITORY TYPE BY ID
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetTerritoryTypeByIdController', () => {
    let controller: GetTerritoryTypeByIdController;
    let service: jest.Mocked<GetTerritoryTypeByIdService>;

    const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';
    const INVALID_UUID = '123e4567-e89b-12d3-a456-426614174999';

    beforeEach(() => {
      service = new GetTerritoryTypeByIdService({} as any, {} as any) as jest.Mocked<GetTerritoryTypeByIdService>;
      controller = new GetTerritoryTypeByIdController(service);
    });

    it('doit retourner 200 avec le type', async () => {
      mockReq.params = { id: VALID_UUID };
      const mockType = { id: VALID_UUID, code: 'DEP', name: 'Dep', hierarchyLevel: 1 };
      service.getTerritoryTypeById.mockResolvedValueOnce(mockType);

      await controller.getTerritoryTypeById(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getTerritoryTypeById).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockType }));
    });

    it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
      mockReq.params = { id: 'uuid-invalide' };

      await controller.getTerritoryTypeById(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.getTerritoryTypeById).not.toHaveBeenCalled();
    });

    it('doit passer l\'erreur à next() en cas d\'échec', async () => {
      mockReq.params = { id: INVALID_UUID };
      const error = new Error('Not found');
      service.getTerritoryTypeById.mockRejectedValueOnce(error);

      await controller.getTerritoryTypeById(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE TERRITORY TYPE
  // ─────────────────────────────────────────────────────────────────────────

  describe('CreateTerritoryTypeController', () => {
    let controller: CreateTerritoryTypeController;
    let service: jest.Mocked<CreateTerritoryTypeService>;

    beforeEach(() => {
      service = new CreateTerritoryTypeService({} as any, {} as any) as jest.Mocked<CreateTerritoryTypeService>;
      controller = new CreateTerritoryTypeController(service);
    });

    it('doit retourner 400 si validation Zod échoue', async () => {
      mockReq.body = { code: '', name: '', hierarchyLevel: 'invalid' };

      await controller.createTerritoryType(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Erreur de validation des données.',
      }));
      expect(service.createTerritoryType).not.toHaveBeenCalled();
    });

    it('doit retourner 201 en cas de succès', async () => {
      mockReq.body = { code: 'PROVINCE', name: 'Province', hierarchyLevel: 2 };
      const mockCreated = { id: 'new-uuid', code: 'PROVINCE', name: 'Province', hierarchyLevel: 2 };
      service.createTerritoryType.mockResolvedValueOnce(mockCreated);

      await controller.createTerritoryType(mockReq as Request, mockRes as Response, mockNext);

      expect(service.createTerritoryType).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockCreated }));
    });

    it('doit passer l\'erreur à next() si le service échoue', async () => {
      mockReq.body = { code: 'PROVINCE', name: 'Province', hierarchyLevel: 2 };
      const error = new Error('Service error');
      service.createTerritoryType.mockRejectedValueOnce(error);

      await controller.createTerritoryType(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE TERRITORY TYPE
  // ─────────────────────────────────────────────────────────────────────────

  describe('UpdateTerritoryTypeController', () => {
    let controller: UpdateTerritoryTypeController;
    let service: jest.Mocked<UpdateTerritoryTypeService>;

    const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

    beforeEach(() => {
      service = new UpdateTerritoryTypeService({} as any, {} as any) as jest.Mocked<UpdateTerritoryTypeService>;
      controller = new UpdateTerritoryTypeController(service);
    });

    it('doit retourner 400 si validation Zod du body échoue', async () => {
      mockReq.params = { id: VALID_UUID };
      mockReq.body = { name: 123 };

      await controller.updateTerritoryType(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.updateTerritoryType).not.toHaveBeenCalled();
    });

    it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
      mockReq.params = { id: 'uuid-invalide' };
      mockReq.body = { name: 'New Name' };

      await controller.updateTerritoryType(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.updateTerritoryType).not.toHaveBeenCalled();
    });

    it('doit retourner 200 en cas de succès', async () => {
      mockReq.params = { id: VALID_UUID };
      mockReq.body = { name: 'New Name' };
      const mockUpdated = { id: VALID_UUID, code: 'DEP', name: 'New Name', hierarchyLevel: 1 };
      service.updateTerritoryType.mockResolvedValueOnce(mockUpdated);

      await controller.updateTerritoryType(mockReq as Request, mockRes as Response, mockNext);

      expect(service.updateTerritoryType).toHaveBeenCalledWith(VALID_UUID, mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockUpdated }));
    });

    it('doit passer l\'erreur à next() si le service échoue', async () => {
      mockReq.params = { id: VALID_UUID };
      mockReq.body = { name: 'New Name' };
      const error = new Error('Not found');
      service.updateTerritoryType.mockRejectedValueOnce(error);

      await controller.updateTerritoryType(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE TERRITORY TYPE
  // ─────────────────────────────────────────────────────────────────────────

  describe('DeleteTerritoryTypeController', () => {
    let controller: DeleteTerritoryTypeController;
    let service: jest.Mocked<DeleteTerritoryTypeService>;

    const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

    beforeEach(() => {
      service = new DeleteTerritoryTypeService({} as any, {} as any) as jest.Mocked<DeleteTerritoryTypeService>;
      controller = new DeleteTerritoryTypeController(service);
    });

    it('doit retourner 200 en cas de succès', async () => {
      mockReq.params = { id: VALID_UUID };
      service.deleteTerritoryType.mockResolvedValueOnce(undefined);

      await controller.deleteTerritoryType(mockReq as Request, mockRes as Response, mockNext);

      expect(service.deleteTerritoryType).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: null }));
    });

    it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
      mockReq.params = { id: 'uuid-invalide' };

      await controller.deleteTerritoryType(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.deleteTerritoryType).not.toHaveBeenCalled();
    });

    it('doit passer l\'erreur à next() si le service échoue', async () => {
      mockReq.params = { id: VALID_UUID };
      const error = new Error('Not found');
      service.deleteTerritoryType.mockRejectedValueOnce(error);

      await controller.deleteTerritoryType(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET ALL TERRITORIES
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetAllTerritoriesController', () => {
    let controller: GetAllTerritoriesController;
    let service: jest.Mocked<GetAllTerritoriesService>;

    beforeEach(() => {
      service = new GetAllTerritoriesService({} as any, {} as any) as jest.Mocked<GetAllTerritoriesService>;
      controller = new GetAllTerritoriesController(service);
    });

    it('doit retourner 200 avec pagination et filtres', async () => {
      mockReq.query = { territoryTypeId: 'type-uuid', parentTerritoryId: 'parent-uuid' };
      const mockResult = { data: [{ id: '1', name: 'Cotonou' }], total: 1, page: 1, limit: 50, totalPages: 1 };
      service.getAllTerritories.mockResolvedValueOnce(mockResult as any);

      await controller.getAllTerritories(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getAllTerritories).toHaveBeenCalledWith(expect.objectContaining({
        territoryTypeId: 'type-uuid',
        parentTerritoryId: 'parent-uuid',
      }));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        pagination: { total: 1, page: 1, limit: 50, totalPages: 1 },
      }));
    });

    it('doit passer l\'erreur à next() en cas d\'échec', async () => {
      const error = new Error('DB error');
      service.getAllTerritories.mockRejectedValueOnce(error);

      await controller.getAllTerritories(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET TERRITORY BY ID
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetTerritoryByIdController', () => {
    let controller: GetTerritoryByIdController;
    let service: jest.Mocked<GetTerritoryByIdService>;

    const VALID_UUID = '123e4567-e89b-12d3-a456-426614174001';
    const INVALID_UUID = '123e4567-e89b-12d3-a456-426614174999';

    beforeEach(() => {
      service = new GetTerritoryByIdService({} as any, {} as any) as jest.Mocked<GetTerritoryByIdService>;
      controller = new GetTerritoryByIdController(service);
    });

    it('doit retourner 200 avec le territoire', async () => {
      mockReq.params = { id: VALID_UUID };
      const mockTerr = { id: VALID_UUID, name: 'Cotonou' };
      service.getTerritoryById.mockResolvedValueOnce(mockTerr as any);

      await controller.getTerritoryById(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getTerritoryById).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockTerr }));
    });

    it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
      mockReq.params = { id: 'uuid-invalide' };

      await controller.getTerritoryById(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.getTerritoryById).not.toHaveBeenCalled();
    });

    it('doit passer l\'erreur à next() en cas d\'échec', async () => {
      mockReq.params = { id: INVALID_UUID };
      const error = new Error('Not found');
      service.getTerritoryById.mockRejectedValueOnce(error);

      await controller.getTerritoryById(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET TERRITORY BY CODE
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetTerritoryByCodeController', () => {
    let controller: GetTerritoryByCodeController;
    let service: jest.Mocked<GetTerritoryByCodeService>;

    beforeEach(() => {
      service = new GetTerritoryByCodeService({} as any, {} as any) as jest.Mocked<GetTerritoryByCodeService>;
      controller = new GetTerritoryByCodeController(service);
    });

    it('doit retourner 200 avec le territoire', async () => {
      mockReq.params = { code: 'BJ-LI-CO' };
      const mockTerr = { id: 'uuid-t', code: 'BJ-LI-CO', name: 'Cotonou' };
      service.getTerritoryByCode.mockResolvedValueOnce(mockTerr as any);

      await controller.getTerritoryByCode(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getTerritoryByCode).toHaveBeenCalledWith('BJ-LI-CO');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockTerr }));
    });

    it('doit retourner 400 si le code est vide', async () => {
      mockReq.params = { code: '' };

      await controller.getTerritoryByCode(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.getTerritoryByCode).not.toHaveBeenCalled();
    });

    it('doit passer l\'erreur à next() en cas d\'échec', async () => {
      mockReq.params = { code: 'INEXISTANT' };
      const error = new Error('Not found');
      service.getTerritoryByCode.mockRejectedValueOnce(error);

      await controller.getTerritoryByCode(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE TERRITORY
  // ─────────────────────────────────────────────────────────────────────────

  describe('CreateTerritoryController', () => {
    let controller: CreateTerritoryController;
    let service: jest.Mocked<CreateTerritoryService>;

    beforeEach(() => {
      service = new CreateTerritoryService({} as any, {} as any) as jest.Mocked<CreateTerritoryService>;
      controller = new CreateTerritoryController(service);
    });

    it('doit retourner 400 si validation Zod échoue', async () => {
      mockReq.body = { name: '' };

      await controller.createTerritory(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Erreur de validation des données.',
      }));
      expect(service.createTerritory).not.toHaveBeenCalled();
    });

    it('doit retourner 201 en cas de succès', async () => {
      mockReq.body = {
        territoryTypeId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Territory',
        code: 'BJ-TEST',
        geometry: { type: 'MultiPolygon', coordinates: [] },
      };
      (mockReq as any).user = { userId: 'creator-uuid' };
      const mockCreated = { id: 'new-uuid', name: 'Test Territory', code: 'BJ-TEST' };
      service.createTerritory.mockResolvedValueOnce(mockCreated as any);

      await controller.createTerritory(mockReq as Request, mockRes as Response, mockNext);

      expect(service.createTerritory).toHaveBeenCalledWith(expect.objectContaining({
        territoryTypeId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Territory',
        code: 'BJ-TEST',
      }), 'creator-uuid');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockCreated }));
    });

    it('doit passer l\'erreur à next() si le service échoue', async () => {
      mockReq.body = {
        territoryTypeId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'X',
        code: 'BJ-X',
        geometry: { type: 'MultiPolygon', coordinates: [] },
      };
      const error = new Error('Service error');
      service.createTerritory.mockRejectedValueOnce(error);

      await controller.createTerritory(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});