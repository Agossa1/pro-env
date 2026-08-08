"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const media_repositories_1 = require("../repositories/media.repositories");
const postgres_1 = __importDefault(require("../../../config/database/postgres"));
const redis_service_1 = require("../../../infra/redis/redis.service");
const appErrors_1 = require("../../../shared/errors/appErrors");
// Mock du logger
const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
};
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
    let mediaRepository;
    let mockDb;
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
        mockDb = new postgres_1.default();
        mockDb.query = jest.fn();
        mockDb.getClient = jest.fn();
        mediaRepository = new media_repositories_1.MediaRepository(mockDb, mockLogger);
        jest.clearAllMocks();
    });
    describe('getAllMedia', () => {
        it('doit retourner une liste paginée avec total et totalPages', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
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
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query
                .mockResolvedValueOnce({ rows: [{ total: 2 }] })
                .mockResolvedValueOnce({ rows: [mockMedia] });
            await mediaRepository.getAllMedia({
                module: 'reports',
                entityId: 'report-1',
                uploadedBy: 'user-1',
            });
            expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('module = $1'), expect.arrayContaining(['reports']));
        });
    });
    describe('getMediaById', () => {
        it('doit retourner le media si trouvé', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockMedia] });
            const result = await mediaRepository.getMediaById('media-1');
            expect(result).toEqual(mockMedia);
        });
        it('doit retourner null si non trouvé', async () => {
            redis_service_1.redisCache.getOrSet.mockImplementation(async (_key, factory) => factory());
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
            expect(redis_service_1.redisCache.invalidatePattern).toHaveBeenCalledWith('media:all:*');
            expect(result).toEqual(mockMedia);
        });
    });
    describe('deleteMedia', () => {
        it('doit supprimer et invalider les caches', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockMedia] });
            const result = await mediaRepository.deleteMedia('media-1');
            expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('DELETE FROM media'), ['media-1']);
            expect(redis_service_1.redisCache.invalidate).toHaveBeenCalledWith('media:id:media-1');
            expect(redis_service_1.redisCache.invalidatePattern).toHaveBeenCalledWith('media:all:*');
            expect(result).toEqual(mockMedia);
        });
        it('doit lever NotFoundError si non trouvé', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });
            await expect(mediaRepository.deleteMedia('uuid-inexistant')).rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
});
//# sourceMappingURL=media.repositories.spec.js.map