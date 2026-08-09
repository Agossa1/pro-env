"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Mock des services
jest.mock('../services/getSocietes.service');
jest.mock('../services/getSocieteById.service');
jest.mock('../services/getSocieteByRegistrationNumber.service');
jest.mock('../services/createSociete.service');
jest.mock('../services/updateSociete.service');
jest.mock('../services/deleteSociete.service');
jest.mock('../services/getSocieteTerritories.service');
// Imports après les mocks
const getSocietes_controller_1 = require("../controller/getSocietes.controller");
const getSocieteById_controller_1 = require("../controller/getSocieteById.controller");
const getSocieteByRegistrationNumber_controller_1 = require("../controller/getSocieteByRegistrationNumber.controller");
const createSociete_controller_1 = require("../controller/createSociete.controller");
const updateSociete_controller_1 = require("../controller/updateSociete.controller");
const deleteSociete_controller_1 = require("../controller/deleteSociete.controller");
const getSocieteTerritories_controller_1 = require("../controller/getSocieteTerritories.controller");
const getSocietes_service_1 = require("../services/getSocietes.service");
const getSocieteById_service_1 = require("../services/getSocieteById.service");
const getSocieteByRegistrationNumber_service_1 = require("../services/getSocieteByRegistrationNumber.service");
const createSociete_service_1 = require("../services/createSociete.service");
const updateSociete_service_1 = require("../services/updateSociete.service");
const deleteSociete_service_1 = require("../services/deleteSociete.service");
const getSocieteTerritories_service_1 = require("../services/getSocieteTerritories.service");
const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';
describe('Societe Controllers', () => {
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
    // GET SOCIETES
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetSocietesController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getSocietes_service_1.GetSocietesService({}, {});
            controller = new getSocietes_controller_1.GetSocietesController(service);
        });
        it('doit retourner 200 avec pagination', async () => {
            const mockResult = {
                data: [{ id: '1', name: 'BTP Bénin', type: 'PRIVATE_COMPANY' }],
                total: 1, page: 1, limit: 50, totalPages: 1,
            };
            service.getSocietes.mockResolvedValueOnce(mockResult);
            await controller.getSocietes(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                pagination: { total: 1, page: 1, limit: 50, totalPages: 1 },
            }));
        });
        it('doit passer l\'erreur à next() si le service échoue', async () => {
            const error = new Error('Service error');
            service.getSocietes.mockRejectedValueOnce(error);
            await controller.getSocietes(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(error);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET SOCIETE BY ID
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetSocieteByIdController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getSocieteById_service_1.GetSocieteByIdService({}, {});
            controller = new getSocieteById_controller_1.GetSocieteByIdController(service);
        });
        it('doit retourner 200 avec la société', async () => {
            mockReq.params = { id: VALID_UUID };
            const mockSociete = { id: VALID_UUID, name: 'BTP Bénin', type: 'PRIVATE_COMPANY' };
            service.getSocieteById.mockResolvedValueOnce(mockSociete);
            await controller.getSocieteById(mockReq, mockRes, mockNext);
            expect(service.getSocieteById).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockSociete }));
        });
        it('doit retourner 400 si l\'id n\'est pas un UUID valide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            await controller.getSocieteById(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.getSocieteById).not.toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET SOCIETE BY REGISTRATION NUMBER
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetSocieteByRegistrationNumberController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getSocieteByRegistrationNumber_service_1.GetSocieteByRegistrationNumberService({}, {});
            controller = new getSocieteByRegistrationNumber_controller_1.GetSocieteByRegistrationNumberController(service);
        });
        it('doit retourner 200 avec la société', async () => {
            mockReq.params = { registrationNumber: 'RCCM-001' };
            const mockSociete = { id: '1', name: 'BTP Bénin', type: 'PRIVATE_COMPANY' };
            service.getSocieteByRegistrationNumber.mockResolvedValueOnce(mockSociete);
            await controller.getSocieteByRegistrationNumber(mockReq, mockRes, mockNext);
            expect(service.getSocieteByRegistrationNumber).toHaveBeenCalledWith('RCCM-001');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockSociete }));
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // CREATE SOCIETE
    // ─────────────────────────────────────────────────────────────────────────
    describe('CreateSocieteController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new createSociete_service_1.CreateSocieteService({}, {});
            controller = new createSociete_controller_1.CreateSocieteController(service);
        });
        it('doit retourner 400 si validation Zod échoue', async () => {
            mockReq.body = { name: '', type: 'invalide' };
            await controller.createSociete(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.createSociete).not.toHaveBeenCalled();
        });
        it('doit retourner 201 en cas de succès', async () => {
            mockReq.body = { name: 'BTP Bénin', type: 'PRIVATE_COMPANY' };
            mockReq.user = { userId: 'user-1', territoryId: 'mairie-uuid' };
            const mockCreated = { id: 'new-uuid', name: 'BTP Bénin', type: 'PRIVATE_COMPANY' };
            service.createSociete.mockResolvedValueOnce(mockCreated);
            await controller.createSociete(mockReq, mockRes, mockNext);
            expect(service.createSociete).toHaveBeenCalledWith(mockReq.body, expect.objectContaining({ userId: 'user-1', territoryId: 'mairie-uuid' }));
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockCreated }));
        });
        it('doit passer le territoryId fourni par l\'admin dans le payload', async () => {
            mockReq.body = { name: 'BTP Bénin', type: 'PRIVATE_COMPANY', territoryId: VALID_UUID };
            mockReq.user = { userId: 'admin-1', territoryId: null };
            const mockCreated = { id: 'new-uuid', name: 'BTP Bénin', type: 'PRIVATE_COMPANY' };
            service.createSociete.mockResolvedValueOnce(mockCreated);
            await controller.createSociete(mockReq, mockRes, mockNext);
            expect(service.createSociete).toHaveBeenCalledWith(expect.objectContaining({ territoryId: VALID_UUID }), expect.objectContaining({ userId: 'admin-1', territoryId: null }));
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE SOCIETE
    // ─────────────────────────────────────────────────────────────────────────
    describe('UpdateSocieteController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new updateSociete_service_1.UpdateSocieteService({}, {});
            controller = new updateSociete_controller_1.UpdateSocieteController(service);
        });
        it('doit retourner 200 en cas de succès', async () => {
            mockReq.params = { id: VALID_UUID };
            mockReq.body = { name: 'New Name' };
            const mockUpdated = { id: VALID_UUID, name: 'New Name', type: 'PRIVATE_COMPANY' };
            service.updateSociete.mockResolvedValueOnce(mockUpdated);
            await controller.updateSociete(mockReq, mockRes, mockNext);
            expect(service.updateSociete).toHaveBeenCalledWith(VALID_UUID, mockReq.body);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
        it('doit retourner 400 si l\'id invalide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            mockReq.body = { name: 'X' };
            await controller.updateSociete(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.updateSociete).not.toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // DELETE SOCIETE
    // ─────────────────────────────────────────────────────────────────────────
    describe('DeleteSocieteController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new deleteSociete_service_1.DeleteSocieteService({}, {});
            controller = new deleteSociete_controller_1.DeleteSocieteController(service);
        });
        it('doit retourner 200 en cas de succès', async () => {
            mockReq.params = { id: VALID_UUID };
            service.deleteSociete.mockResolvedValueOnce(undefined);
            await controller.deleteSociete(mockReq, mockRes, mockNext);
            expect(service.deleteSociete).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: null }));
        });
        it('doit retourner 400 si l\'id invalide', async () => {
            mockReq.params = { id: 'uuid-invalide' };
            await controller.deleteSociete(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(service.deleteSociete).not.toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET SOCIETE TERRITORIES
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetSocieteTerritoriesController', () => {
        let controller;
        let service;
        beforeEach(() => {
            service = new getSocieteTerritories_service_1.GetSocieteTerritoriesService({}, {});
            controller = new getSocieteTerritories_controller_1.GetSocieteTerritoriesController(service);
        });
        it('doit retourner 200 avec les territoires', async () => {
            mockReq.params = { id: VALID_UUID };
            const mockTerritories = [{ id: 'ot-1', societeId: VALID_UUID, territoryId: 'terr-1', isActive: true }];
            service.getSocieteTerritories.mockResolvedValueOnce(mockTerritories);
            await controller.getSocieteTerritories(mockReq, mockRes, mockNext);
            expect(service.getSocieteTerritories).toHaveBeenCalledWith(VALID_UUID);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: mockTerritories }));
        });
    });
});
//# sourceMappingURL=societes.controllers.spec.js.map