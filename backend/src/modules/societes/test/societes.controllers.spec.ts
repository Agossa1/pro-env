import type { Request, Response, NextFunction } from 'express';

// 1. Mock Redis immediately to stop background connection loops
jest.mock('redis', () => ({
  createClient: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(null),
    disconnect: jest.fn().mockResolvedValue(null),
    on: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
  })),
}));

// Mock des services
jest.mock('../services/getSocietes.service');
jest.mock('../services/getSocieteById.service');
jest.mock('../services/getSocieteByRegistrationNumber.service');
jest.mock('../services/createSociete.service');
jest.mock('../services/updateSociete.service');
jest.mock('../services/deleteSociete.service');
jest.mock('../services/getSocieteTerritories.service');

// Imports après les mocks
import { GetSocietesController } from '../controller/getSocietes.controller';
import { GetSocieteByIdController } from '../controller/getSocieteById.controller';
import { GetSocieteByRegistrationNumberController } from '../controller/getSocieteByRegistrationNumber.controller';
import { CreateSocieteController } from '../controller/createSociete.controller';
import { UpdateSocieteController } from '../controller/updateSociete.controller';
import { DeleteSocieteController } from '../controller/deleteSociete.controller';
import { GetSocieteTerritoriesController } from '../controller/getSocieteTerritories.controller';

import { GetSocietesService } from '../services/getSocietes.service';
import { GetSocieteByIdService } from '../services/getSocieteById.service';
import { GetSocieteByRegistrationNumberService } from '../services/getSocieteByRegistrationNumber.service';
import { CreateSocieteService } from '../services/createSociete.service';
import { CreateSocieteAccountService } from '../services/createSocieteAccount.service';
import { UpdateSocieteService } from '../services/updateSociete.service';
import { DeleteSocieteService } from '../services/deleteSociete.service';
import { GetSocieteTerritoriesService } from '../services/getSocieteTerritories.service';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

describe('Societe Controllers', () => {
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
  // GET SOCIETES
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetSocietesController', () => {
    let controller: GetSocietesController;
    let service: jest.Mocked<GetSocietesService>;

    beforeEach(() => {
      service = new GetSocietesService({} as any, {} as any) as jest.Mocked<GetSocietesService>;
      controller = new GetSocietesController(service);
    });

    it('doit retourner 200 avec pagination', async () => {
      const mockResult = {
        data: [{ id: '1', name: 'BTP Bénin', type: 'PRIVATE_COMPANY' }],
        total: 1, page: 1, limit: 50, totalPages: 1,
      };
      service.getSocietes.mockResolvedValueOnce(mockResult as any);

      await controller.getSocietes(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        pagination: { total: 1, page: 1, limit: 50, totalPages: 1 },
      }));
    });

    it('doit passer l\'erreur à next() si le service échoue', async () => {
      const error = new Error('Service error');
      service.getSocietes.mockRejectedValueOnce(error);

      await controller.getSocietes(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET SOCIETE BY ID
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetSocieteByIdController', () => {
    let controller: GetSocieteByIdController;
    let service: jest.Mocked<GetSocieteByIdService>;

    beforeEach(() => {
      service = new GetSocieteByIdService({} as any, {} as any) as jest.Mocked<GetSocieteByIdService>;
      controller = new GetSocieteByIdController(service);
    });

    it('doit retourner 200 avec la société', async () => {
      mockReq.params = { id: VALID_UUID };
      const mockSociete = { id: VALID_UUID, name: 'BTP Bénin', type: 'PRIVATE_COMPANY' };
      service.getSocieteById.mockResolvedValueOnce(mockSociete as any);

      await controller.getSocieteById(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getSocieteById).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockSociete }));
    });

    it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
      mockReq.params = { id: 'uuid-invalide' };

      await controller.getSocieteById(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.getSocieteById).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET SOCIETE BY REGISTRATION NUMBER
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetSocieteByRegistrationNumberController', () => {
    let controller: GetSocieteByRegistrationNumberController;
    let service: jest.Mocked<GetSocieteByRegistrationNumberService>;

    beforeEach(() => {
      service = new GetSocieteByRegistrationNumberService({} as any, {} as any) as jest.Mocked<GetSocieteByRegistrationNumberService>;
      controller = new GetSocieteByRegistrationNumberController(service);
    });

    it('doit retourner 200 avec la société', async () => {
      mockReq.params = { registrationNumber: 'RCCM-001' };
      const mockSociete = { id: '1', name: 'BTP Bénin', type: 'PRIVATE_COMPANY' };
      service.getSocieteByRegistrationNumber.mockResolvedValueOnce(mockSociete as any);

      await controller.getSocieteByRegistrationNumber(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getSocieteByRegistrationNumber).toHaveBeenCalledWith('RCCM-001');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockSociete }));
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE SOCIETE
  // ─────────────────────────────────────────────────────────────────────────

  describe('CreateSocieteController', () => {
    let controller: CreateSocieteController;
    let service: jest.Mocked<CreateSocieteService>;

    beforeEach(() => {
      service = new CreateSocieteService(
        {} as any,
        {} as any,
        { createSocieteAccount: jest.fn() } as unknown as CreateSocieteAccountService,
      ) as jest.Mocked<CreateSocieteService>;
      controller = new CreateSocieteController(service);
    });

    it('doit retourner 400 si validation Zod échoue', async () => {
      mockReq.body = { name: '', type: 'invalide' };

      await controller.createSociete(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.createSociete).not.toHaveBeenCalled();
    });

    it('doit retourner 21 en cas de succès', async () => {
      mockReq.body = { name: 'BTP Bénin', type: 'PRIVATE_COMPANY', contactEmail: 'test@example.com' };
      (mockReq as any).user = { userId: 'user-1', municipalityId: 'mairie-uuid' };
      const mockCreated = { id: 'new-uuid', name: 'BTP Bénin', type: 'PRIVATE_COMPANY' };
      service.createSociete.mockResolvedValueOnce(mockCreated as any);

      await controller.createSociete(mockReq as Request, mockRes as Response, mockNext);

      expect(service.createSociete).toHaveBeenCalledWith(
        mockReq.body,
        expect.objectContaining({ userId: 'user-1', municipalityId: 'mairie-uuid' })
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockCreated }));
    });
  });
});
