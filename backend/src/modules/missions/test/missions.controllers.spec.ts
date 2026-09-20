import type { Request, Response, NextFunction } from 'express';

// Mock des services
jest.mock('../services/getMissions.service');
jest.mock('../services/getMissionById.service');
jest.mock('../services/createMission.service');
jest.mock('../services/updateMission.service');
jest.mock('../services/deleteMission.service');
jest.mock('../services/getMissionChecklist.service');
jest.mock('../services/addChecklistItem.service');
jest.mock('../services/assignUserToMission.service');
jest.mock('../services/getMissionStatusHistory.service');

// Imports après les mocks
import { GetMissionsController } from '../controller/getMissions.controller';
import { GetMissionByIdController } from '../controller/getMissionById.controller';
import { CreateMissionController } from '../controller/createMission.controller';
import { UpdateMissionController } from '../controller/updateMission.controller';
import { DeleteMissionController } from '../controller/deleteMission.controller';
import { GetMissionChecklistController } from '../controller/getMissionChecklist.controller';
import { AddChecklistItemController } from '../controller/addChecklistItem.controller';
import { AssignUserToMissionController } from '../controller/assignUserToMission.controller';
import { GetMissionStatusHistoryController } from '../controller/getMissionStatusHistory.controller';

import { GetMissionsService } from '../services/getMissions.service';
import { GetMissionByIdService } from '../services/getMissionById.service';
import { CreateMissionService } from '../services/createMission.service';
import { UpdateMissionService } from '../services/updateMission.service';
import { DeleteMissionService } from '../services/deleteMission.service';
import { GetMissionChecklistService } from '../services/getMissionChecklist.service';
import { AddChecklistItemService } from '../services/addChecklistItem.service';
import { AssignUserToMissionService } from '../services/assignUserToMission.service';
import { GetMissionStatusHistoryService } from '../services/getMissionStatusHistory.service';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

describe('Mission Controllers', () => {
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
  // GET MISSIONS
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetMissionsController', () => {
    let controller: GetMissionsController;
    let service: jest.Mocked<GetMissionsService>;

    beforeEach(() => {
      service = new GetMissionsService({} as any, {} as any) as jest.Mocked<GetMissionsService>;
      controller = new GetMissionsController(service);
    });

    it('doit retourner 200 avec pagination', async () => {
      const mockResult = {
        data: [{ id: '1', title: 'Réparation caniveau', missionType: 'repair' }],
        total: 1, page: 1, limit: 50, totalPages: 1,
      };
      service.getMissions.mockResolvedValueOnce(mockResult as any);

      await controller.getMissions(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        pagination: { total: 1, page: 1, limit: 50, totalPages: 1 },
      }));
    });

    it('doit passer l\'erreur à next()', async () => {
      const error = new Error('Service error');
      service.getMissions.mockRejectedValueOnce(error);

      await controller.getMissions(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET MISSION BY ID
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetMissionByIdController', () => {
    let controller: GetMissionByIdController;
    let service: jest.Mocked<GetMissionByIdService>;

    beforeEach(() => {
      service = new GetMissionByIdService({} as any, {} as any) as jest.Mocked<GetMissionByIdService>;
      controller = new GetMissionByIdController(service);
    });

    it('doit retourner 200 avec la mission', async () => {
      mockReq.params = { id: VALID_UUID };
      const mockMission = { id: VALID_UUID, title: 'Réparation', missionType: 'repair' };
      service.getMissionById.mockResolvedValueOnce(mockMission as any);

      await controller.getMissionById(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getMissionById).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockMission }));
    });

    it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
      mockReq.params = { id: 'uuid-invalide' };

      await controller.getMissionById(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.getMissionById).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE MISSION
  // ─────────────────────────────────────────────────────────────────────────

  describe('CreateMissionController', () => {
    let controller: CreateMissionController;
    let service: jest.Mocked<CreateMissionService>;

    beforeEach(() => {
      service = new CreateMissionService({} as any, {} as any) as jest.Mocked<CreateMissionService>;
      controller = new CreateMissionController(service);
    });

    it('doit retourner 400 si validation Zod échoue', async () => {
      mockReq.body = { municipalityId: 'uuid-invalide', title: '', missionType: 'invalide' };

      await controller.createMission(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.createMission).not.toHaveBeenCalled();
    });

    it('doit retourner 201 en cas de succès avec le créateur', async () => {
      mockReq.body = { municipalityId: VALID_UUID, title: 'Réparation', missionType: 'repair' };
      (mockReq as any).user = { userId: 'user-1' };
      const mockCreated = { id: 'new-uuid', title: 'Réparation', missionType: 'repair' };
      service.createMission.mockResolvedValueOnce(mockCreated as any);

      await controller.createMission(mockReq as Request, mockRes as Response, mockNext);

      expect(service.createMission).toHaveBeenCalledWith(
        mockReq.body,
        expect.objectContaining({ userId: 'user-1' })
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockCreated }));
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE MISSION
  // ─────────────────────────────────────────────────────────────────────────

  describe('UpdateMissionController', () => {
    let controller: UpdateMissionController;
    let service: jest.Mocked<UpdateMissionService>;

    beforeEach(() => {
      service = new UpdateMissionService({} as any, {} as any) as jest.Mocked<UpdateMissionService>;
      controller = new UpdateMissionController(service);
    });

    it('doit retourner 200 en cas de succès', async () => {
      mockReq.params = { id: VALID_UUID };
      mockReq.body = { title: 'Nouveau titre' };
      const mockUpdated = { id: VALID_UUID, title: 'Nouveau titre', missionType: 'repair' };
      service.updateMission.mockResolvedValueOnce(mockUpdated as any);

      await controller.updateMission(mockReq as Request, mockRes as Response, mockNext);

      expect(service.updateMission).toHaveBeenCalledWith(VALID_UUID, mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('doit retourner 400 si l\'id invalide', async () => {
      mockReq.params = { id: 'uuid-invalide' };
      mockReq.body = { title: 'X' };

      await controller.updateMission(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.updateMission).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE MISSION
  // ─────────────────────────────────────────────────────────────────────────

  describe('DeleteMissionController', () => {
    let controller: DeleteMissionController;
    let service: jest.Mocked<DeleteMissionService>;

    beforeEach(() => {
      service = new DeleteMissionService({} as any, {} as any) as jest.Mocked<DeleteMissionService>;
      controller = new DeleteMissionController(service);
    });

    it('doit retourner 200 en cas de succès', async () => {
      mockReq.params = { id: VALID_UUID };
      service.deleteMission.mockResolvedValueOnce(undefined);

      await controller.deleteMission(mockReq as Request, mockRes as Response, mockNext);

      expect(service.deleteMission).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: null }));
    });

    it('doit retourner 400 si l\'id invalide', async () => {
      mockReq.params = { id: 'uuid-invalide' };

      await controller.deleteMission(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.deleteMission).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CHECKLIST
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetMissionChecklistController', () => {
    let controller: GetMissionChecklistController;
    let service: jest.Mocked<GetMissionChecklistService>;

    beforeEach(() => {
      service = new GetMissionChecklistService({} as any, {} as any) as jest.Mocked<GetMissionChecklistService>;
      controller = new GetMissionChecklistController(service);
    });

    it('doit retourner 200 avec la checklist', async () => {
      mockReq.params = { id: VALID_UUID };
      const mockItems = [{ id: 'c1', missionId: VALID_UUID, label: 'Vérifier', done: false, doneBy: null, doneAt: null, sortOrder: 1, createdAt: new Date() }];
      service.getMissionChecklist.mockResolvedValueOnce(mockItems);

      await controller.getMissionChecklist(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getMissionChecklist).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockItems }));
    });
  });

  describe('AddChecklistItemController', () => {
    let controller: AddChecklistItemController;
    let service: jest.Mocked<AddChecklistItemService>;

    beforeEach(() => {
      service = new AddChecklistItemService({} as any, {} as any) as jest.Mocked<AddChecklistItemService>;
      controller = new AddChecklistItemController(service);
    });

    it('doit retourner 201 en cas de succès', async () => {
      mockReq.params = { id: VALID_UUID };
      mockReq.body = { label: 'Vérifier' };
      const mockItem = { id: 'c1', missionId: VALID_UUID, label: 'Vérifier', done: false, doneBy: null, doneAt: null, sortOrder: 1, createdAt: new Date() };
      service.addChecklistItem.mockResolvedValueOnce(mockItem);

      await controller.addChecklistItem(mockReq as Request, mockRes as Response, mockNext);

      expect(service.addChecklistItem).toHaveBeenCalledWith(VALID_UUID, 'Vérifier');
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockItem }));
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // ASSIGNMENTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('AssignUserToMissionController', () => {
    let controller: AssignUserToMissionController;
    let service: jest.Mocked<AssignUserToMissionService>;

    beforeEach(() => {
      service = new AssignUserToMissionService({} as any, {} as any) as jest.Mocked<AssignUserToMissionService>;
      controller = new AssignUserToMissionController(service);
    });

    it('doit retourner 200 en cas de succès', async () => {
      mockReq.params = { id: VALID_UUID };
      mockReq.body = { userId: VALID_UUID };
      (mockReq as any).user = { userId: 'admin-1' };
      const mockAssignment = { id: 'a1', missionId: VALID_UUID, userId: VALID_UUID, assignedBy: 'admin-1', isActive: true, assignedAt: new Date(), unassignedAt: null };
      service.assignUserToMission.mockResolvedValueOnce(mockAssignment);

      await controller.assignUserToMission(mockReq as Request, mockRes as Response, mockNext);

      expect(service.assignUserToMission).toHaveBeenCalledWith(
        VALID_UUID,
        VALID_UUID,
        expect.objectContaining({ assignedBy: 'admin-1' })
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // STATUT HISTORY
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetMissionStatusHistoryController', () => {
    let controller: GetMissionStatusHistoryController;
    let service: jest.Mocked<GetMissionStatusHistoryService>;

    beforeEach(() => {
      service = new GetMissionStatusHistoryService({} as any, {} as any) as jest.Mocked<GetMissionStatusHistoryService>;
      controller = new GetMissionStatusHistoryController(service);
    });

    it('doit retourner 200 avec l\'historique', async () => {
      mockReq.params = { id: VALID_UUID };
      const mockHistory = [{ id: 'h1', missionId: VALID_UUID, oldStatus: null, newStatus: 'draft', changedBy: null, createdAt: new Date() }];
      service.getMissionStatusHistory.mockResolvedValueOnce(mockHistory as any);

      await controller.getMissionStatusHistory(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getMissionStatusHistory).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockHistory }));
    });
  });
});