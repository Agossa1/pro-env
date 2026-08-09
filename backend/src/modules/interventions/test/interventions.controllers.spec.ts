import type { Request, Response, NextFunction } from 'express';

// Mock des services
jest.mock('../services/getInterventions.service');
jest.mock('../services/getInterventionById.service');
jest.mock('../services/createIntervention.service');
jest.mock('../services/updateIntervention.service');
jest.mock('../services/deleteIntervention.service');
jest.mock('../services/createFieldReport.service');
jest.mock('../services/getInterventionReports.service');

// Imports après les mocks
import { GetInterventionsController } from '../controller/getInterventions.controller';
import { GetInterventionByIdController } from '../controller/getInterventionById.controller';
import { CreateInterventionController } from '../controller/createIntervention.controller';
import { UpdateInterventionController } from '../controller/updateIntervention.controller';
import { DeleteInterventionController } from '../controller/deleteIntervention.controller';
import { CreateFieldReportController } from '../controller/createFieldReport.controller';
import { GetInterventionReportsController } from '../controller/getInterventionReports.controller';

import { GetInterventionsService } from '../services/getInterventions.service';
import { GetInterventionByIdService } from '../services/getInterventionById.service';
import { CreateInterventionService } from '../services/createIntervention.service';
import { UpdateInterventionService } from '../services/updateIntervention.service';
import { DeleteInterventionService } from '../services/deleteIntervention.service';
import { CreateFieldReportService } from '../services/createFieldReport.service';
import { GetInterventionReportsService } from '../services/getInterventionReports.service';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

describe('Intervention Controllers', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = { body: {}, params: {}, query: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('GetInterventionsController', () => {
    let controller: GetInterventionsController;
    let service: jest.Mocked<GetInterventionsService>;

    beforeEach(() => {
      service = new GetInterventionsService({} as any, {} as any) as jest.Mocked<GetInterventionsService>;
      controller = new GetInterventionsController(service);
    });

    it('doit retourner 200 avec pagination', async () => {
      const mockResult = { data: [{ id: '1', interventionType: 'cleaning', status: 'not_started' }], total: 1, page: 1, limit: 50, totalPages: 1 };
      service.getInterventions.mockResolvedValueOnce(mockResult as any);

      await controller.getInterventions(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        pagination: { total: 1, page: 1, limit: 50, totalPages: 1 },
      }));
    });

    it('doit passer l\'erreur à next()', async () => {
      const error = new Error('Service error');
      service.getInterventions.mockRejectedValueOnce(error);

      await controller.getInterventions(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('GetInterventionByIdController', () => {
    let controller: GetInterventionByIdController;
    let service: jest.Mocked<GetInterventionByIdService>;

    beforeEach(() => {
      service = new GetInterventionByIdService({} as any, {} as any) as jest.Mocked<GetInterventionByIdService>;
      controller = new GetInterventionByIdController(service);
    });

    it('doit retourner 200 avec l\'intervention', async () => {
      mockReq.params = { id: VALID_UUID };
      const mockIntervention = { id: VALID_UUID, interventionType: 'cleaning', status: 'not_started' };
      service.getInterventionById.mockResolvedValueOnce(mockIntervention as any);

      await controller.getInterventionById(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getInterventionById).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockIntervention }));
    });

    it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
      mockReq.params = { id: 'uuid-invalide' };

      await controller.getInterventionById(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.getInterventionById).not.toHaveBeenCalled();
    });
  });

  describe('CreateInterventionController', () => {
    let controller: CreateInterventionController;
    let service: jest.Mocked<CreateInterventionService>;

    beforeEach(() => {
      service = new CreateInterventionService({} as any, {} as any) as jest.Mocked<CreateInterventionService>;
      controller = new CreateInterventionController(service);
    });

    it('doit retourner 400 si validation Zod échoue', async () => {
      mockReq.body = { missionId: 'uuid-invalide', assignedTeamId: '', interventionType: '' };

      await controller.createIntervention(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.createIntervention).not.toHaveBeenCalled();
    });

    it('doit retourner 201 en cas de succès', async () => {
      mockReq.body = { missionId: VALID_UUID, assignedTeamId: VALID_UUID, interventionType: 'cleaning' };
      const mockCreated = { id: 'new-uuid', interventionType: 'cleaning', status: 'not_started' };
      service.createIntervention.mockResolvedValueOnce(mockCreated as any);

      await controller.createIntervention(mockReq as Request, mockRes as Response, mockNext);

      expect(service.createIntervention).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockCreated }));
    });
  });

  describe('UpdateInterventionController', () => {
    let controller: UpdateInterventionController;
    let service: jest.Mocked<UpdateInterventionService>;

    beforeEach(() => {
      service = new UpdateInterventionService({} as any, {} as any) as jest.Mocked<UpdateInterventionService>;
      controller = new UpdateInterventionController(service);
    });

    it('doit retourner 200 en cas de succès', async () => {
      mockReq.params = { id: VALID_UUID };
      mockReq.body = { status: 'started' };
      const mockUpdated = { id: VALID_UUID, interventionType: 'cleaning', status: 'started' };
      service.updateIntervention.mockResolvedValueOnce(mockUpdated as any);

      await controller.updateIntervention(mockReq as Request, mockRes as Response, mockNext);

      expect(service.updateIntervention).toHaveBeenCalledWith(VALID_UUID, mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('doit retourner 400 si l\'id invalide', async () => {
      mockReq.params = { id: 'uuid-invalide' };
      mockReq.body = { status: 'started' };

      await controller.updateIntervention(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.updateIntervention).not.toHaveBeenCalled();
    });
  });

  describe('DeleteInterventionController', () => {
    let controller: DeleteInterventionController;
    let service: jest.Mocked<DeleteInterventionService>;

    beforeEach(() => {
      service = new DeleteInterventionService({} as any, {} as any) as jest.Mocked<DeleteInterventionService>;
      controller = new DeleteInterventionController(service);
    });

    it('doit retourner 200 en cas de succès', async () => {
      mockReq.params = { id: VALID_UUID };
      service.deleteIntervention.mockResolvedValueOnce(undefined);

      await controller.deleteIntervention(mockReq as Request, mockRes as Response, mockNext);

      expect(service.deleteIntervention).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: null }));
    });
  });

  describe('CreateFieldReportController', () => {
    let controller: CreateFieldReportController;
    let service: jest.Mocked<CreateFieldReportService>;

    beforeEach(() => {
      service = new CreateFieldReportService({} as any, {} as any) as jest.Mocked<CreateFieldReportService>;
      controller = new CreateFieldReportController(service);
    });

    it('doit retourner 201 en cas de succès avec l\'auteur', async () => {
      mockReq.params = { id: VALID_UUID };
      mockReq.body = { workDone: 'Travaux effectués', completed: true };
      (mockReq as any).user = { userId: 'user-1' };
      const mockReport = { id: 'r1', interventionId: VALID_UUID, createdBy: 'user-1', workDone: 'Travaux effectués', completed: true };
      service.createFieldReport.mockResolvedValueOnce(mockReport as any);

      await controller.createFieldReport(mockReq as Request, mockRes as Response, mockNext);

      expect(service.createFieldReport).toHaveBeenCalledWith(
        expect.objectContaining({ interventionId: VALID_UUID }),
        expect.objectContaining({ userId: 'user-1' })
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('GetInterventionReportsController', () => {
    let controller: GetInterventionReportsController;
    let service: jest.Mocked<GetInterventionReportsService>;

    beforeEach(() => {
      service = new GetInterventionReportsService({} as any, {} as any) as jest.Mocked<GetInterventionReportsService>;
      controller = new GetInterventionReportsController(service);
    });

    it('doit retourner 200 avec les rapports', async () => {
      mockReq.params = { id: VALID_UUID };
      const mockReports = [{ id: 'r1', interventionId: VALID_UUID, createdBy: 'user-1', completed: true }];
      service.getInterventionReports.mockResolvedValueOnce(mockReports as any);

      await controller.getInterventionReports(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getInterventionReports).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockReports }));
    });
  });
});