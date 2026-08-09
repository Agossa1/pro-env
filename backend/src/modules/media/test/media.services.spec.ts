import { Logger } from 'winston';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';
import { MediaRepository } from '../repositories/media.repositories';
import { CloudinaryService } from '../../../shared/services/cloudinary.service';
import sharp from 'sharp';

// Mocks
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(), 
  warn: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

jest.mock('../repositories/media.repositories');
jest.mock('../../../shared/services/cloudinary.service');
jest.mock('sharp', () => {
  const chainable = {
    resize: jest.fn().mockReturnThis(),
    jpeg: jest.fn().mockReturnThis(),
    toBuffer: jest.fn().mockResolvedValue(Buffer.from('optimized')),
  };
  return jest.fn().mockReturnValue(chainable);
});

// Services
import { GetMediaService } from '../services/getMedia.service';
import { GetMediaByIdService } from '../services/getMediaById.service';
import { UploadMediaService } from '../services/uploadMedia.service';
import { DeleteMediaService } from '../services/deleteMedia.service';
import { GetEntityMediaService } from '../services/getEntityMedia.service';

describe('Media Services', () => {
  let mediaRepository: jest.Mocked<MediaRepository>;
  let cloudinaryService: jest.Mocked<CloudinaryService>;

  beforeEach(() => {
    mediaRepository = new MediaRepository({} as any, mockLogger) as jest.Mocked<MediaRepository>;
    cloudinaryService = new CloudinaryService() as jest.Mocked<CloudinaryService>;
    jest.clearAllMocks();
  });

  describe('GetMediaService', () => {
    let service: GetMediaService;
    beforeEach(() => { service = new GetMediaService(mediaRepository, mockLogger); });

    it('doit retourner une liste paginée', async () => {
      const mockResult = { data: [{ id: '1', fileName: 'photo.jpg' }], total: 1, page: 1, limit: 50, totalPages: 1 };
      mediaRepository.getAllMedia.mockResolvedValueOnce(mockResult as any);

      const result = await service.getMedia({ page: 1, limit: 50 });

      expect(result).toEqual(mockResult);
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('doit logger et propager l\'erreur', async () => {
      mediaRepository.getAllMedia.mockRejectedValueOnce(new Error('DB error'));
      await expect(service.getMedia()).rejects.toThrow('DB error');
    });
  });

  describe('GetMediaByIdService', () => {
    let service: GetMediaByIdService;
    beforeEach(() => { service = new GetMediaByIdService(mediaRepository, mockLogger); });

    it('doit retourner le media si trouvé', async () => {
      const mockMedia = { id: '1', fileName: 'photo.jpg' };
      mediaRepository.getMediaById.mockResolvedValueOnce(mockMedia as any);
      expect(await service.getMediaById('1')).toEqual(mockMedia);
    });

    it('doit lever NotFoundError si inexistant', async () => {
      mediaRepository.getMediaById.mockResolvedValueOnce(null);
      await expect(service.getMediaById('uuid-inexistant')).rejects.toThrow(NotFoundError);
    });
  });

  describe('UploadMediaService', () => {
    let service: UploadMediaService;
    beforeEach(() => { service = new UploadMediaService(mediaRepository, cloudinaryService, mockLogger); });

    it('doit lever BadRequestError si fichier vide', async () => {
      await expect(service.uploadMedia({ buffer: Buffer.alloc(0), originalName: 'x', mimetype: 'image/jpeg', size: 0 }))
        .rejects.toThrow(BadRequestError);
    });

    it('doit uploader une image (Sharp + Cloudinary + BDD)', async () => {
      cloudinaryService.uploadBuffer.mockResolvedValueOnce({ url: 'https://cloudinary/x.jpg', publicId: 'sigie/x.jpg' });
      const mockMedia = { id: '1', fileName: 'x.jpg', storagePath: 'https://cloudinary/x.jpg', publicId: 'sigie/x.jpg' };
      mediaRepository.saveMedia.mockResolvedValueOnce(mockMedia as any);

      const result = await service.uploadMedia({
        buffer: Buffer.from('image-data'), 
        originalName: 'x.jpg', 
        mimetype: 'image/jpeg', 
        size: 100,
        uploadedBy: 'user-1',
      });

      expect(sharp).toHaveBeenCalled();
      expect(cloudinaryService.uploadBuffer).toHaveBeenCalled();
      expect(mediaRepository.saveMedia).toHaveBeenCalledWith(expect.objectContaining({ uploadedBy: 'user-1' }));
      expect(result).toEqual(mockMedia);
      expect(mockLogger.info).not.toHaveBeenCalled(); // pas de log success dans uploadMedia
    });
  });

  describe('DeleteMediaService', () => {
    let service: DeleteMediaService;
    beforeEach(() => { service = new DeleteMediaService(mediaRepository, cloudinaryService, mockLogger); });

    it('doit supprimer la métadonnée + le fichier Cloudinary', async () => {
      mediaRepository.getMediaById.mockResolvedValueOnce({ id: '1', publicId: 'sigie/x.jpg' } as any);
      mediaRepository.deleteMedia.mockResolvedValueOnce({} as any);
      cloudinaryService.remove.mockResolvedValueOnce(undefined);

      await service.deleteMedia('1');

      expect(cloudinaryService.remove).toHaveBeenCalledWith('sigie/x.jpg');
      expect(mediaRepository.deleteMedia).toHaveBeenCalledWith('1');
    });

    it('doit lever NotFoundError si inexistant', async () => {
      mediaRepository.getMediaById.mockResolvedValueOnce(null);
      await expect(service.deleteMedia('1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('GetEntityMediaService', () => {
    let service: GetEntityMediaService;
    beforeEach(() => { service = new GetEntityMediaService(mediaRepository, mockLogger); });

    it('doit retourner les médias de l\'entité', async () => {
      const mockResult = { data: [{ id: '1', fileName: 'photo.jpg' }], total: 1, page: 1, limit: 50, totalPages: 1 };
      mediaRepository.getAllMedia.mockResolvedValueOnce(mockResult as any);

      const result = await service.getEntityMedia('entity-1');

      expect(mediaRepository.getAllMedia).toHaveBeenCalledWith(expect.objectContaining({ entityId: 'entity-1' }));
      expect(result).toHaveLength(1);
    });
  });
});