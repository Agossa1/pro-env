"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const getTerritoryTypes_controller_1 = require("../controller/getTerritoryTypes.controller");
const getTerritoryTypeByCode_controller_1 = require("../controller/getTerritoryTypeByCode.controller");
const getTerritoryTypeById_controller_1 = require("../controller/getTerritoryTypeById.controller");
const createTerritoryType_controller_1 = require("../controller/createTerritoryType.controller");
const updateTerritoryType_controller_1 = require("../controller/updateTerritoryType.controller");
const deleteTerritoryType_controller_1 = require("../controller/deleteTerritoryType.controller");
const getAllTerritories_controller_1 = require("../controller/getAllTerritories.controller");
const getTerritoryById_controller_1 = require("../controller/getTerritoryById.controller");
const getTerritoryByCode_controller_1 = require("../controller/getTerritoryByCode.controller");
const createTerritory_controller_1 = require("../controller/createTerritory.controller");
const getTerritoryTypes_service_1 = require("../services/getTerritoryTypes.service");
const getTerritoryTypeByCode_service_1 = require("../services/getTerritoryTypeByCode.service");
const getTerritoryTypeById_service_1 = require("../services/getTerritoryTypeById.service");
const createTerritoryType_service_1 = require("../services/createTerritoryType.service");
const updateTerritoryType_service_1 = require("../services/updateTerritoryType.service");
const deleteTerritoryType_service_1 = require("../services/deleteTerritoryType.service");
const getAllTerritories_service_1 = require("../services/getAllTerritories.service");
const getTerritoryById_service_1 = require("../services/getTerritoryById.service");
const getTerritoryByCode_service_1 = require("../services/getTerritoryByCode.service");
const createTerritory_service_1 = require("../services/createTerritory.service");
describe('Territory Controllers', () => {
    let mockReq;
    let mockRes;
    let mockNext;
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
        let controller;
        let service;
        beforeEach(() => {
            service = new getTerritoryTypes_service_1.GetTerritoryTypesService({}, {});
            controller = new getTerritoryTypes_controller_1.GetTerritoryTypesController(service);
        });
        it('doit retourner 200 avec pagination', async () => {
            const mockResult = { data: [{ id: '1', code: 'DEP', name: 'Dep', hierarchyLevel: 1 }], total: 1, page: 1, limit: 50, totalPages: 1 };
            service.getTerritoryTypes.mockResolvedValueOnce(mockResult);
            await controller.getTerritoryTypes(mockReq, mockRes, mockNext);
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
            await controller.getTerritoryTypes(mockReq, mockRes, mockNext);
            expect(service.getTerritoryTypes).toHaveBeenCalledWith({ page: 2, limit: 10 });
        });
        it('doit passer l\'erreur à next() si le service échoue', async () => {
            const error = new Error('Service error');
            service.getTerritoryTypes.mockRejectedValueOnce(error);
            await controller.getTerritoryTypes(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET TERRITORY TYPE BY CODE
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetTerritoryTypeByCodeController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getTerritoryTypeByCode_service_1.GetTerritoryTypeByCodeService({}, {});
            controller = new getTerritoryTypeByCode_controller_1.GetTerritoryTypeByCodeController(service);
        });
        it('doit retourner 200 avec le type', async () => {
            mockReq.params = { code: 'DEPARTMENT' };
            const mockType = { id: '1', code: 'DEPARTMENT', name: 'Department', hierarchyLevel: 1 };
            service.getTerritoryTypeByCode.mockResolvedValueOnce(mockType);
            await controller.getTerritoryTypeByCode(mockReq, mockRes, mockNext);
            expect(service.getTerritoryTypeByCode).toHaveBeenCalledWith('DEPARTMENT');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockType }));
        });
        it('doit retourner 400 si le code est vide', async () => {
            mockReq.params = { code: '' };
            await controller.getTerritoryTypeByCode(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.getTerritoryTypeByCode).not.toHaveBeenCalled();
        });
        it('doit passer l\'erreur à next() si le service échoue', async () => {
            mockReq.params = { code: 'INEXISTANT' };
            const error = new Error('Not found');
            service.getTerritoryTypeByCode.mockRejectedValueOnce(error);
            await controller.getTerritoryTypeByCode(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET TERRITORY TYPE BY ID
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetTerritoryTypeByIdController', () => {
        let controller;
        let service;
        const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';
        const INVALID_UUID = '123e4567-e89b-12d3-a456-426614174999';
        beforeEach(() => {
            service = new getTerritoryTypeById_service_1.GetTerritoryTypeByIdService({}, {});
            controller = new getTerritoryTypeById_controller_1.GetTerritoryTypeByIdController(service);
        });
        it('doit retourner 200 avec le type', async () => {
            mockReq.params = { id: VALID_UUID };
            const mockType = { id: VALID_UUID, code: 'DEP', name: 'Dep', hierarchyLevel: 1 };
            service.getTerritoryTypeById.mockResolvedValueOnce(mockType);
            await controller.getTerritoryTypeById(mockReq, mockRes, mockNext);
            expect(service.getTerritoryTypeById).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockType }));
        });
        it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            await controller.getTerritoryTypeById(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.getTerritoryTypeById).not.toHaveBeenCalled();
        });
        it('doit passer l\'erreur à next() en cas d\'échec', async () => {
            mockReq.params = { id: INVALID_UUID };
            const error = new Error('Not found');
            service.getTerritoryTypeById.mockRejectedValueOnce(error);
            await controller.getTerritoryTypeById(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // CREATE TERRITORY TYPE
    // ─────────────────────────────────────────────────────────────────────────
    describe('CreateTerritoryTypeController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new createTerritoryType_service_1.CreateTerritoryTypeService({}, {});
            controller = new createTerritoryType_controller_1.CreateTerritoryTypeController(service);
        });
        it('doit retourner 400 si validation Zod échoue', async () => {
            mockReq.body = { code: '', name: '', hierarchyLevel: 'invalid' };
            await controller.createTerritoryType(mockReq, mockRes, mockNext);
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
            await controller.createTerritoryType(mockReq, mockRes, mockNext);
            expect(service.createTerritoryType).toHaveBeenCalledWith(mockReq.body);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockCreated }));
        });
        it('doit passer l\'erreur à next() si le service échoue', async () => {
            mockReq.body = { code: 'PROVINCE', name: 'Province', hierarchyLevel: 2 };
            const error = new Error('Service error');
            service.createTerritoryType.mockRejectedValueOnce(error);
            await controller.createTerritoryType(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE TERRITORY TYPE
    // ─────────────────────────────────────────────────────────────────────────
    describe('UpdateTerritoryTypeController', () => {
        let controller;
        let service;
        const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';
        beforeEach(() => {
            service = new updateTerritoryType_service_1.UpdateTerritoryTypeService({}, {});
            controller = new updateTerritoryType_controller_1.UpdateTerritoryTypeController(service);
        });
        it('doit retourner 400 si validation Zod du body échoue', async () => {
            mockReq.params = { id: VALID_UUID };
            mockReq.body = { name: 123 };
            await controller.updateTerritoryType(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.updateTerritoryType).not.toHaveBeenCalled();
        });
        it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            mockReq.body = { name: 'New Name' };
            await controller.updateTerritoryType(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.updateTerritoryType).not.toHaveBeenCalled();
        });
        it('doit retourner 200 en cas de succès', async () => {
            mockReq.params = { id: VALID_UUID };
            mockReq.body = { name: 'New Name' };
            const mockUpdated = { id: VALID_UUID, code: 'DEP', name: 'New Name', hierarchyLevel: 1 };
            service.updateTerritoryType.mockResolvedValueOnce(mockUpdated);
            await controller.updateTerritoryType(mockReq, mockRes, mockNext);
            expect(service.updateTerritoryType).toHaveBeenCalledWith(VALID_UUID, mockReq.body);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockUpdated }));
        });
        it('doit passer l\'erreur à next() si le service échoue', async () => {
            mockReq.params = { id: VALID_UUID };
            mockReq.body = { name: 'New Name' };
            const error = new Error('Not found');
            service.updateTerritoryType.mockRejectedValueOnce(error);
            await controller.updateTerritoryType(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // DELETE TERRITORY TYPE
    // ─────────────────────────────────────────────────────────────────────────
    describe('DeleteTerritoryTypeController', () => {
        let controller;
        let service;
        const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';
        beforeEach(() => {
            service = new deleteTerritoryType_service_1.DeleteTerritoryTypeService({}, {});
            controller = new deleteTerritoryType_controller_1.DeleteTerritoryTypeController(service);
        });
        it('doit retourner 200 en cas de succès', async () => {
            mockReq.params = { id: VALID_UUID };
            service.deleteTerritoryType.mockResolvedValueOnce(undefined);
            await controller.deleteTerritoryType(mockReq, mockRes, mockNext);
            expect(service.deleteTerritoryType).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: null }));
        });
        it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            await controller.deleteTerritoryType(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.deleteTerritoryType).not.toHaveBeenCalled();
        });
        it('doit passer l\'erreur à next() si le service échoue', async () => {
            mockReq.params = { id: VALID_UUID };
            const error = new Error('Not found');
            service.deleteTerritoryType.mockRejectedValueOnce(error);
            await controller.deleteTerritoryType(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET ALL TERRITORIES
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetAllTerritoriesController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getAllTerritories_service_1.GetAllTerritoriesService({}, {});
            controller = new getAllTerritories_controller_1.GetAllTerritoriesController(service);
        });
        it('doit retourner 200 avec pagination et filtres', async () => {
            mockReq.query = { territoryTypeId: 'type-uuid', parentTerritoryId: 'parent-uuid' };
            const mockResult = { data: [{ id: '1', name: 'Cotonou' }], total: 1, page: 1, limit: 50, totalPages: 1 };
            service.getAllTerritories.mockResolvedValueOnce(mockResult);
            await controller.getAllTerritories(mockReq, mockRes, mockNext);
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
            await controller.getAllTerritories(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET TERRITORY BY ID
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetTerritoryByIdController', () => {
        let controller;
        let service;
        const VALID_UUID = '123e4567-e89b-12d3-a456-426614174001';
        const INVALID_UUID = '123e4567-e89b-12d3-a456-426614174999';
        beforeEach(() => {
            service = new getTerritoryById_service_1.GetTerritoryByIdService({}, {});
            controller = new getTerritoryById_controller_1.GetTerritoryByIdController(service);
        });
        it('doit retourner 200 avec le territoire', async () => {
            mockReq.params = { id: VALID_UUID };
            const mockTerr = { id: VALID_UUID, name: 'Cotonou' };
            service.getTerritoryById.mockResolvedValueOnce(mockTerr);
            await controller.getTerritoryById(mockReq, mockRes, mockNext);
            expect(service.getTerritoryById).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockTerr }));
        });
        it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            await controller.getTerritoryById(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.getTerritoryById).not.toHaveBeenCalled();
        });
        it('doit passer l\'erreur à next() en cas d\'échec', async () => {
            mockReq.params = { id: INVALID_UUID };
            const error = new Error('Not found');
            service.getTerritoryById.mockRejectedValueOnce(error);
            await controller.getTerritoryById(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET TERRITORY BY CODE
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetTerritoryByCodeController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getTerritoryByCode_service_1.GetTerritoryByCodeService({}, {});
            controller = new getTerritoryByCode_controller_1.GetTerritoryByCodeController(service);
        });
        it('doit retourner 200 avec le territoire', async () => {
            mockReq.params = { code: 'BJ-LI-CO' };
            const mockTerr = { id: 'uuid-t', code: 'BJ-LI-CO', name: 'Cotonou' };
            service.getTerritoryByCode.mockResolvedValueOnce(mockTerr);
            await controller.getTerritoryByCode(mockReq, mockRes, mockNext);
            expect(service.getTerritoryByCode).toHaveBeenCalledWith('BJ-LI-CO');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockTerr }));
        });
        it('doit retourner 400 si le code est vide', async () => {
            mockReq.params = { code: '' };
            await controller.getTerritoryByCode(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.getTerritoryByCode).not.toHaveBeenCalled();
        });
        it('doit passer l\'erreur à next() en cas d\'échec', async () => {
            mockReq.params = { code: 'INEXISTANT' };
            const error = new Error('Not found');
            service.getTerritoryByCode.mockRejectedValueOnce(error);
            await controller.getTerritoryByCode(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // CREATE TERRITORY
    // ─────────────────────────────────────────────────────────────────────────
    describe('CreateTerritoryController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new createTerritory_service_1.CreateTerritoryService({}, {});
            controller = new createTerritory_controller_1.CreateTerritoryController(service);
        });
        it('doit retourner 400 si validation Zod échoue', async () => {
            mockReq.body = { name: '' };
            await controller.createTerritory(mockReq, mockRes, mockNext);
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
            mockReq.user = { userId: 'creator-uuid' };
            const mockCreated = { id: 'new-uuid', name: 'Test Territory', code: 'BJ-TEST' };
            service.createTerritory.mockResolvedValueOnce(mockCreated);
            await controller.createTerritory(mockReq, mockRes, mockNext);
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
            await controller.createTerritory(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
});
//# sourceMappingURL=territory.controllers.spec.js.map