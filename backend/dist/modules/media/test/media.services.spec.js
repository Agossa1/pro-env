"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appErrors_1 = require("../../../shared/errors/appErrors");
const media_repositories_1 = require("../repositories/media.repositories");
const cloudinary_service_1 = require("../../../shared/services/cloudinary.service");
const sharp_1 = __importDefault(require("sharp"));
// Mocks
const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
};
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
const getMedia_service_1 = require("../services/getMedia.service");
const getMediaById_service_1 = require("../services/getMediaById.service");
const uploadMedia_service_1 = require("../services/uploadMedia.service");
const deleteMedia_service_1 = require("../services/deleteMedia.service");
const getEntityMedia_service_1 = require("../services/getEntityMedia.service");
describe('Media Services', () => {
    let mediaRepository;
    let cloudinaryService;
    beforeEach(() => {
        mediaRepository = new media_repositories_1.MediaRepository({}, mockLogger);
        cloudinaryService = new cloudinary_service_1.CloudinaryService();
        jest.clearAllMocks();
    });
    describe('GetMediaService', () => {
        let service;
        beforeEach(() => { service = new getMedia_service_1.GetMediaService(mediaRepository, mockLogger); });
        it('doit retourner une liste paginée', async () => {
            const mockResult = { data: [{ id: '1', fileName: 'photo.jpg' }], total: 1, page: 1, limit: 50, totalPages: 1 };
            mediaRepository.getAllMedia.mockResolvedValueOnce(mockResult);
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
        let service;
        beforeEach(() => { service = new getMediaById_service_1.GetMediaByIdService(mediaRepository, mockLogger); });
        it('doit retourner le media si trouvé', async () => {
            const mockMedia = { id: '1', fileName: 'photo.jpg' };
            mediaRepository.getMediaById.mockResolvedValueOnce(mockMedia);
            expect(await service.getMediaById('1')).toEqual(mockMedia);
        });
        it('doit lever NotFoundError si inexistant', async () => {
            mediaRepository.getMediaById.mockResolvedValueOnce(null);
            await expect(service.getMediaById('uuid-inexistant')).rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    describe('UploadMediaService', () => {
        let service;
        beforeEach(() => { service = new uploadMedia_service_1.UploadMediaService(mediaRepository, cloudinaryService, mockLogger); });
        it('doit lever BadRequestError si fichier vide', async () => {
            await expect(service.uploadMedia({ buffer: Buffer.alloc(0), originalName: 'x', mimetype: 'image/jpeg', size: 0 }))
                .rejects.toThrow(appErrors_1.BadRequestError);
        });
        it('doit uploader une image (Sharp + Cloudinary + BDD)', async () => {
            cloudinaryService.uploadBuffer.mockResolvedValueOnce({ url: 'https://cloudinary/x.jpg', publicId: 'sigie/x.jpg' });
            const mockMedia = { id: '1', fileName: 'x.jpg', storagePath: 'https://cloudinary/x.jpg', publicId: 'sigie/x.jpg' };
            mediaRepository.saveMedia.mockResolvedValueOnce(mockMedia);
            const result = await service.uploadMedia({
                buffer: Buffer.from('image-data'),
                originalName: 'x.jpg',
                mimetype: 'image/jpeg',
                size: 100,
                uploadedBy: 'user-1',
            });
            expect(sharp_1.default).toHaveBeenCalled();
            expect(cloudinaryService.uploadBuffer).toHaveBeenCalled();
            expect(mediaRepository.saveMedia).toHaveBeenCalledWith(expect.objectContaining({ uploadedBy: 'user-1' }));
            expect(result).toEqual(mockMedia);
            expect(mockLogger.info).not.toHaveBeenCalled(); // pas de log success dans uploadMedia
        });
    });
    describe('DeleteMediaService', () => {
        let service;
        beforeEach(() => { service = new deleteMedia_service_1.DeleteMediaService(mediaRepository, cloudinaryService, mockLogger); });
        it('doit supprimer la métadonnée + le fichier Cloudinary', async () => {
            mediaRepository.getMediaById.mockResolvedValueOnce({ id: '1', publicId: 'sigie/x.jpg' });
            mediaRepository.deleteMedia.mockResolvedValueOnce({});
            cloudinaryService.remove.mockResolvedValueOnce(undefined);
            await service.deleteMedia('1');
            expect(cloudinaryService.remove).toHaveBeenCalledWith('sigie/x.jpg');
            expect(mediaRepository.deleteMedia).toHaveBeenCalledWith('1');
        });
        it('doit lever NotFoundError si inexistant', async () => {
            mediaRepository.getMediaById.mockResolvedValueOnce(null);
            await expect(service.deleteMedia('1')).rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    describe('GetEntityMediaService', () => {
        let service;
        beforeEach(() => { service = new getEntityMedia_service_1.GetEntityMediaService(mediaRepository, mockLogger); });
        it('doit retourner les médias de l\'entité', async () => {
            const mockResult = { data: [{ id: '1', fileName: 'photo.jpg' }], total: 1, page: 1, limit: 50, totalPages: 1 };
            mediaRepository.getAllMedia.mockResolvedValueOnce(mockResult);
            const result = await service.getEntityMedia('entity-1');
            expect(mediaRepository.getAllMedia).toHaveBeenCalledWith(expect.objectContaining({ entityId: 'entity-1' }));
            expect(result).toHaveLength(1);
        });
    });
});
//# sourceMappingURL=media.services.spec.js.map