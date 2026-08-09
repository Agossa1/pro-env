import { MediaRepository } from '../repositories/media.repositories';
import PostgresDatabase from '../../../config/database/postgres';
import { Logger } from 'winston';
import { redisCache } from '../../../infra/redis/redis.service';
import { NotFoundError } from '../../../shared/errors/appErrors';

// Mock du logger
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

// Mock complet de PostgresDatabase
jest.mock('@/config/database/postgres');
jest.mock('@/infra/redis/redis.service', () => ({
  redisCache: {
    getOrSet: jest.fn(),
    invalidate: jest.fn(),
    invalidatePattern: jest.fn(),
  }
}));

describe('MediaRepository', () => {
  let mediaRepository: MediaRepository;
  let mockDb: jest.Mocked<PostgresDatabase>;

  const mockMedia = {
    id: 'media-1',
    module: 'reports',
    entityId: 'report-1',
    fileName: 'photo.jpg',
    mimeType: 'image/jpeg',
    sizeBytes: 204800,
    storagePath: 'https://res.cloudinary.com/demo/sigie/photo.jpg',
    publicId: 'sigie/photo.jpg',
    uploadedBy: 'user-1',
    createdAt: new Date(),
  };

  beforeEach(() => {
    mockDb = new PostgresDatabase() as jest.Mocked<PostgresDatabase>;
    mockDb.query = jest.fn();
    mockDb.getClient = jest.fn();
    mediaRepository = new MediaRepository(mockDb, mockLogger);
    jest.clearAllMocks();
  });

  describe('getAllMedia', () => {
    it('doit retourner une liste paginée avec total et totalPages', async () => {
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());

      mockDb.query
        .mockResolvedValueOnce({ rows: [{ total: 25 }] }) // count
        .mockResolvedValueOnce({ rows: [mockMedia] }); // data

      const result = await mediaRepository.getAllMedia({ page: 1, limit: 10 });

      expect(result.total).toBe(25);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(3);
      expect(result.data).toHaveLength(1);
    });

    it('doit appliquer les filtres module/entityId/uploadedBy', async () => {
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());

      mockDb.query
        .mockResolvedValueOnce({ rows: [{ total: 2 }] })
        .mockResolvedValueOnce({ rows: [mockMedia] });

      await mediaRepository.getAllMedia({
        module: 'reports',
        entityId: 'report-1',
        uploadedBy: 'user-1',
      });

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('module = $1'),
        expect.arrayContaining(['reports'])
      );
    });
  });

  describe('getMediaById', () => {
    it('doit retourner le media si trouvé', async () => {
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());
      mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockMedia] });

      const result = await mediaRepository.getMediaById('media-1');

      expect(result).toEqual(mockMedia);
    });

    it('doit retourner null si non trouvé', async () => {
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());
      mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const result = await mediaRepository.getMediaById('uuid-inexistant');

      expect(result).toBeNull();
    });
  });

  describe('saveMedia', () => {
    it('doit enregistrer les métadonnées et invalider le cache', async () => {
      mockDb.query.mockResolvedValueOnce({ rows: [mockMedia] });

      const result = await mediaRepository.saveMedia({
        module: 'reports',
        entityId: 'report-1',
        fileName: 'photo.jpg',
        mimeType: 'image/jpeg',
        sizeBytes: 204800,
        storagePath: 'https://res.cloudinary.com/demo/sigie/photo.jpg',
        publicId: 'sigie/photo.jpg',
        uploadedBy: 'user-1',
      });

      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO media'), expect.any(Array));
      expect(redisCache.invalidatePattern).toHaveBeenCalledWith('media:all:*');
      expect(result).toEqual(mockMedia);
    });
  });

  describe('deleteMedia', () => {
    it('doit supprimer et invalider les caches', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockMedia] });

      const result = await mediaRepository.deleteMedia('media-1');

      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM media'), ['media-1']);
      expect(redisCache.invalidate).toHaveBeenCalledWith('media:id:media-1');
      expect(redisCache.invalidatePattern).toHaveBeenCalledWith('media:all:*');
      expect(result).toEqual(mockMedia);
    });

    it('doit lever NotFoundError si non trouvé', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      await expect(mediaRepository.deleteMedia('uuid-inexistant')).rejects.toThrow(NotFoundError);
    });
  });
});