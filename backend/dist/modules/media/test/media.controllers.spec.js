"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Mock des services
jest.mock('../services/getMedia.service');
jest.mock('../services/getMediaById.service');
jest.mock('../services/uploadMedia.service');
jest.mock('../services/deleteMedia.service');
jest.mock('../services/getEntityMedia.service');
// Imports après les mocks
const getMedia_controller_1 = require("../controller/getMedia.controller");
const getMediaById_controller_1 = require("../controller/getMediaById.controller");
const uploadMedia_controller_1 = require("../controller/uploadMedia.controller");
const deleteMedia_controller_1 = require("../controller/deleteMedia.controller");
const getEntityMedia_controller_1 = require("../controller/getEntityMedia.controller");
const getMedia_service_1 = require("../services/getMedia.service");
const getMediaById_service_1 = require("../services/getMediaById.service");
const uploadMedia_service_1 = require("../services/uploadMedia.service");
const deleteMedia_service_1 = require("../services/deleteMedia.service");
const getEntityMedia_service_1 = require("../services/getEntityMedia.service");
const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';
describe('Media Controllers', () => {
    let mockReq;
    let mockRes;
    let mockNext;
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
        let controller;
        let service;
        beforeEach(() => {
            service = new getMedia_service_1.GetMediaService({}, {});
            controller = new getMedia_controller_1.GetMediaController(service);
        });
        it('doit retourner 200 avec pagination', async () => {
            const mockResult = { data: [{ id: '1', fileName: 'photo.jpg' }], total: 1, page: 1, limit: 50, totalPages: 1 };
            service.getMedia.mockResolvedValueOnce(mockResult);
            await controller.getMedia(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                pagination: { total: 1, page: 1, limit: 50, totalPages: 1 },
            }));
        });
        it('doit passer l\'erreur à next()', async () => {
            service.getMedia.mockRejectedValueOnce(new Error('Service error'));
            await controller.getMedia(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });
    });
    describe('GetMediaByIdController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getMediaById_service_1.GetMediaByIdService({}, {});
            controller = new getMediaById_controller_1.GetMediaByIdController(service);
        });
        it('doit retourner 200 avec le media', async () => {
            mockReq.params = { id: VALID_UUID };
            const mockMedia = { id: VALID_UUID, fileName: 'photo.jpg' };
            service.getMediaById.mockResolvedValueOnce(mockMedia);
            await controller.getMediaById(mockReq, mockRes, mockNext);
            expect(service.getMediaById).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockMedia }));
        });
        it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            await controller.getMediaById(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.getMediaById).not.toHaveBeenCalled();
        });
    });
    describe('UploadMediaController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new uploadMedia_service_1.UploadMediaService({}, {}, {});
            controller = new uploadMedia_controller_1.UploadMediaController(service);
        });
        it('doit retourner 400 si aucun fichier', async () => {
            mockReq.file = undefined;
            await controller.uploadMedia(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.uploadMedia).not.toHaveBeenCalled();
        });
        it('doit retourner 201 si fichier fourni', async () => {
            mockReq.file = {
                buffer: Buffer.from('data'),
                originalname: 'photo.jpg',
                mimetype: 'image/jpeg',
                size: 100,
            };
            mockReq.user = { userId: 'user-1' };
            const mockMedia = { id: '1', fileName: 'photo.jpg' };
            service.uploadMedia.mockResolvedValueOnce(mockMedia);
            await controller.uploadMedia(mockReq, mockRes, mockNext);
            expect(service.uploadMedia).toHaveBeenCalledWith(expect.objectContaining({ uploadedBy: 'user-1' }));
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockMedia }));
        });
    });
    describe('DeleteMediaController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new deleteMedia_service_1.DeleteMediaService({}, {}, {});
            controller = new deleteMedia_controller_1.DeleteMediaController(service);
        });
        it('doit retourner 200 en cas de succès', async () => {
            mockReq.params = { id: VALID_UUID };
            service.deleteMedia.mockResolvedValueOnce(undefined);
            await controller.deleteMedia(mockReq, mockRes, mockNext);
            expect(service.deleteMedia).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: null }));
        });
        it('doit retourner 400 si l\'id invalide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            await controller.deleteMedia(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.deleteMedia).not.toHaveBeenCalled();
        });
    });
    describe('GetEntityMediaController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getEntityMedia_service_1.GetEntityMediaService({}, {});
            controller = new getEntityMedia_controller_1.GetEntityMediaController(service);
        });
        it('doit retourner 200 avec les médias de l\'entité', async () => {
            mockReq.params = { entityId: VALID_UUID };
            const mockMedia = [{ id: '1', fileName: 'photo.jpg' }];
            service.getEntityMedia.mockResolvedValueOnce(mockMedia);
            await controller.getEntityMedia(mockReq, mockRes, mockNext);
            expect(service.getEntityMedia).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockMedia }));
        });
    });
});
//# sourceMappingURL=media.controllers.spec.js.map