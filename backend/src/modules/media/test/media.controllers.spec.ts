import type { Request, Response, NextFunction } from 'express';

// Mock des services
jest.mock('../services/getMedia.service');
jest.mock('../services/getMediaById.service');
jest.mock('../services/uploadMedia.service');
jest.mock('../services/deleteMedia.service');
jest.mock('../services/getEntityMedia.service');

// Imports après les mocks
import { GetMediaController } from '../controller/getMedia.controller';
import { GetMediaByIdController } from '../controller/getMediaById.controller';
import { UploadMediaController } from '../controller/uploadMedia.controller';
import { DeleteMediaController } from '../controller/deleteMedia.controller';
import { GetEntityMediaController } from '../controller/getEntityMedia.controller';

import { GetMediaService } from '../services/getMedia.service';
import { GetMediaByIdService } from '../services/getMediaById.service';
import { UploadMediaService } from '../services/uploadMedia.service';
import { DeleteMediaService } from '../services/deleteMedia.service';
import { GetEntityMediaService } from '../services/getEntityMedia.service';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

describe('Media Controllers', () => {
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

  describe('GetMediaController', () => {
    let controller: GetMediaController;
    let service: jest.Mocked<GetMediaService>;

    beforeEach(() => {
      service = new GetMediaService({} as any, {} as any) as jest.Mocked<GetMediaService>;
      controller = new GetMediaController(service);
    });

    it('doit retourner 200 avec pagination', async () => {
      const mockResult = { data: [{ id: '1', fileName: 'photo.jpg' }], total: 1, page: 1, limit: 50, totalPages: 1 };
      service.getMedia.mockResolvedValueOnce(mockResult as any);

      await controller.getMedia(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        pagination: { total: 1, page: 1, limit: 50, totalPages: 1 },
      }));
    });

    it('doit passer l\'erreur à next()', async () => {
      service.getMedia.mockRejectedValueOnce(new Error('Service error'));
      await controller.getMedia(mockReq as Request, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('GetMediaByIdController', () => {
    let controller: GetMediaByIdController;
    let service: jest.Mocked<GetMediaByIdService>;

    beforeEach(() => {
      service = new GetMediaByIdService({} as any, {} as any) as jest.Mocked<GetMediaByIdService>;
      controller = new GetMediaByIdController(service);
    });

    it('doit retourner 200 avec le media', async () => {
      mockReq.params = { id: VALID_UUID };
      const mockMedia = { id: VALID_UUID, fileName: 'photo.jpg' };
      service.getMediaById.mockResolvedValueOnce(mockMedia as any);

      await controller.getMediaById(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getMediaById).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockMedia }));
    });

    it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
      mockReq.params = { id: 'uuid-invalide' };

      await controller.getMediaById(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.getMediaById).not.toHaveBeenCalled();
    });
  });

  describe('UploadMediaController', () => {
    let controller: UploadMediaController;
    let service: jest.Mocked<UploadMediaService>;

    beforeEach(() => {
      service = new UploadMediaService({} as any, {} as any, {} as any) as jest.Mocked<UploadMediaService>;
      controller = new UploadMediaController(service);
    });

    it('doit retourner 400 si aucun fichier', async () => {
      (mockReq as any).file = undefined;

      await controller.uploadMedia(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.uploadMedia).not.toHaveBeenCalled();
    });

    it('doit retourner 201 si fichier fourni', async () => {
      (mockReq as any).file = {
        buffer: Buffer.from('data'),
        originalname: 'photo.jpg',
        mimetype: 'image/jpeg',
        size: 100,
      };
      (mockReq as any).user = { userId: 'user-1' };
      const mockMedia = { id: '1', fileName: 'photo.jpg' };
      service.uploadMedia.mockResolvedValueOnce(mockMedia as any);

      await controller.uploadMedia(mockReq as Request, mockRes as Response, mockNext);

      expect(service.uploadMedia).toHaveBeenCalledWith(expect.objectContaining({ uploadedBy: 'user-1' }));
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockMedia }));
    });
  });

  describe('DeleteMediaController', () => {
    let controller: DeleteMediaController;
    let service: jest.Mocked<DeleteMediaService>;

    beforeEach(() => {
      service = new DeleteMediaService({} as any, {} as any, {} as any) as jest.Mocked<DeleteMediaService>;
      controller = new DeleteMediaController(service);
    });

    it('doit retourner 200 en cas de succès', async () => {
      mockReq.params = { id: VALID_UUID };
      service.deleteMedia.mockResolvedValueOnce(undefined);

      await controller.deleteMedia(mockReq as Request, mockRes as Response, mockNext);

      expect(service.deleteMedia).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: null }));
    });

    it('doit retourner 400 si l\'id invalide', async () => {
      mockReq.params = { id: 'uuid-invalide' };

      await controller.deleteMedia(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(service.deleteMedia).not.toHaveBeenCalled();
    });
  });

  describe('GetEntityMediaController', () => {
    let controller: GetEntityMediaController;
    let service: jest.Mocked<GetEntityMediaService>;

    beforeEach(() => {
      service = new GetEntityMediaService({} as any, {} as any) as jest.Mocked<GetEntityMediaService>;
      controller = new GetEntityMediaController(service);
    });

    it('doit retourner 200 avec les médias de l\'entité', async () => {
      mockReq.params = { entityId: VALID_UUID };
      const mockMedia = [{ id: '1', fileName: 'photo.jpg' }];
      service.getEntityMedia.mockResolvedValueOnce(mockMedia as any);

      await controller.getEntityMedia(mockReq as Request, mockRes as Response, mockNext);

      expect(service.getEntityMedia).toHaveBeenCalledWith(VALID_UUID);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockMedia }));
    });
  });
});