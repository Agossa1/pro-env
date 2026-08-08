"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appErrors_1 = require("../../../shared/errors/appErrors");
const societe_repositories_1 = require("../repositories/societe.repositories");
// Mock dependencies
const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
};
jest.mock('../repositories/societe.repositories');
// Services
const getSocietes_service_1 = require("../services/getSocietes.service");
const getSocieteById_service_1 = require("../services/getSocieteById.service");
const getSocieteByRegistrationNumber_service_1 = require("../services/getSocieteByRegistrationNumber.service");
const createSociete_service_1 = require("../services/createSociete.service");
const updateSociete_service_1 = require("../services/updateSociete.service");
const deleteSociete_service_1 = require("../services/deleteSociete.service");
const getSocieteTerritories_service_1 = require("../services/getSocieteTerritories.service");
describe('Societe Services', () => {
    let societeRepository;
    beforeEach(() => {
        societeRepository = new societe_repositories_1.SocieteRepository({}, mockLogger);
        jest.clearAllMocks();
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET SOCIETES
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetSocietesService', () => {
        let service;
        beforeEach(() => {
            service = new getSocietes_service_1.GetSocietesService(societeRepository, mockLogger);
        });
        it('doit retourner une liste paginée', async () => {
            const mockResult = {
                data: [{ id: '1', name: 'BTP Bénin', type: 'PRIVATE_COMPANY' }],
                total: 1, page: 1, limit: 50, totalPages: 1,
            };
            societeRepository.getAllSocietes.mockResolvedValueOnce(mockResult);
            const result = await service.getSocietes({ page: 1, limit: 50 });
            expect(result).toEqual(mockResult);
            expect(mockLogger.info).toHaveBeenCalled();
        });
        it('doit logger et propager l\'erreur', async () => {
            const error = new Error('DB error');
            societeRepository.getAllSocietes.mockRejectedValueOnce(error);
            await expect(service.getSocietes()).rejects.toThrow('DB error');
            expect(mockLogger.error).toHaveBeenCalled();
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET SOCIETE BY ID
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetSocieteByIdService', () => {
        let service;
        beforeEach(() => {
            service = new getSocieteById_service_1.GetSocieteByIdService(societeRepository, mockLogger);
        });
        it('doit retourner la société si trouvée', async () => {
            const mockSociete = { id: '1', name: 'BTP Bénin', type: 'PRIVATE_COMPANY' };
            societeRepository.getSocieteById.mockResolvedValueOnce(mockSociete);
            const result = await service.getSocieteById('1');
            expect(result).toEqual(mockSociete);
        });
        it('doit lever NotFoundError si inexistante', async () => {
            societeRepository.getSocieteById.mockResolvedValueOnce(null);
            await expect(service.getSocieteById('uuid-inexistant')).rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET SOCIETE BY REGISTRATION NUMBER
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetSocieteByRegistrationNumberService', () => {
        let service;
        beforeEach(() => {
            service = new getSocieteByRegistrationNumber_service_1.GetSocieteByRegistrationNumberService(societeRepository, mockLogger);
        });
        it('doit retourner la société si trouvée', async () => {
            const mockSociete = { id: '1', name: 'BTP Bénin', type: 'PRIVATE_COMPANY' };
            societeRepository.getSocieteByRegistrationNumber.mockResolvedValueOnce(mockSociete);
            const result = await service.getSocieteByRegistrationNumber('RCCM-001');
            expect(result).toEqual(mockSociete);
        });
        it('doit lever NotFoundError si non trouvée', async () => {
            societeRepository.getSocieteByRegistrationNumber.mockResolvedValueOnce(null);
            await expect(service.getSocieteByRegistrationNumber('INEXISTANT'))
                .rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // CREATE SOCIETE
    // ─────────────────────────────────────────────────────────────────────────
    describe('CreateSocieteService', () => {
        let service;
        beforeEach(() => {
            service = new createSociete_service_1.CreateSocieteService(societeRepository, mockLogger);
        });
        it('doit lever BadRequestError si nom/type absents', async () => {
            await expect(service.createSociete({ name: '', type: '' }))
                .rejects.toThrow(appErrors_1.BadRequestError);
        });
        it('doit lever BadRequestError si n° d\'enregistrement déjà utilisé', async () => {
            societeRepository.getSocieteByRegistrationNumber.mockResolvedValueOnce({
                id: '1', name: 'Existant', type: 'PRIVATE_COMPANY',
            });
            await expect(service.createSociete({
                name: 'Nouveau', type: 'PRIVATE_COMPANY', registrationNumber: 'RCCM-001',
            })).rejects.toThrow(appErrors_1.BadRequestError);
        });
        it('doit créer la société avec succès', async () => {
            societeRepository.getSocieteByRegistrationNumber.mockResolvedValueOnce(null);
            const mockCreated = { id: 'new-uuid', name: 'BTP Bénin', type: 'PRIVATE_COMPANY' };
            societeRepository.createSociete.mockResolvedValueOnce(mockCreated);
            const result = await service.createSociete({ name: 'BTP Bénin', type: 'PRIVATE_COMPANY' });
            expect(result).toEqual(mockCreated);
            expect(mockLogger.info).toHaveBeenCalled();
        });
        it('doit associer la société au territoire du créateur (mairie/ministère)', async () => {
            societeRepository.getSocieteByRegistrationNumber.mockResolvedValueOnce(null);
            const mockCreated = { id: 'new-uuid', name: 'BTP Bénin', type: 'PRIVATE_COMPANY' };
            societeRepository.createSociete.mockResolvedValueOnce(mockCreated);
            await service.createSociete({ name: 'BTP Bénin', type: 'PRIVATE_COMPANY' }, { userId: 'user-1', territoryId: 'mairie-uuid' });
            expect(societeRepository.createSociete).toHaveBeenCalledWith(expect.objectContaining({ territoryId: 'mairie-uuid' }));
        });
        it('doit utiliser le territoryId fourni par l\'admin (association libre)', async () => {
            societeRepository.getSocieteByRegistrationNumber.mockResolvedValueOnce(null);
            const mockCreated = { id: 'new-uuid', name: 'BTP Bénin', type: 'PRIVATE_COMPANY' };
            societeRepository.createSociete.mockResolvedValueOnce(mockCreated);
            await service.createSociete({ name: 'BTP Bénin', type: 'PRIVATE_COMPANY', territoryId: 'ministere-uuid' }, { userId: 'admin-1', territoryId: null });
            expect(societeRepository.createSociete).toHaveBeenCalledWith(expect.objectContaining({ territoryId: 'ministere-uuid' }));
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // UPDATE SOCIETE
    // ─────────────────────────────────────────────────────────────────────────
    describe('UpdateSocieteService', () => {
        let service;
        beforeEach(() => {
            service = new updateSociete_service_1.UpdateSocieteService(societeRepository, mockLogger);
        });
        it('doit mettre à jour la société', async () => {
            const mockUpdated = { id: '1', name: 'New Name', type: 'PRIVATE_COMPANY' };
            societeRepository.updateSociete.mockResolvedValueOnce(mockUpdated);
            const result = await service.updateSociete('1', { name: 'New Name' });
            expect(result).toEqual(mockUpdated);
        });
        it('doit lever NotFoundError si inexistante', async () => {
            societeRepository.updateSociete.mockResolvedValueOnce(null);
            await expect(service.updateSociete('uuid-inexistant', { name: 'X' }))
                .rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // DELETE SOCIETE
    // ─────────────────────────────────────────────────────────────────────────
    describe('DeleteSocieteService', () => {
        let service;
        beforeEach(() => {
            service = new deleteSociete_service_1.DeleteSocieteService(societeRepository, mockLogger);
        });
        it('doit supprimer la société', async () => {
            societeRepository.deleteSociete.mockResolvedValueOnce(undefined);
            await service.deleteSociete('1');
            expect(societeRepository.deleteSociete).toHaveBeenCalledWith('1');
            expect(mockLogger.info).toHaveBeenCalled();
        });
        it('doit propager BadRequestError si références existantes', async () => {
            const error = new appErrors_1.BadRequestError('Références existantes');
            societeRepository.deleteSociete.mockRejectedValueOnce(error);
            await expect(service.deleteSociete('1')).rejects.toThrow(appErrors_1.BadRequestError);
        });
    });
    // ─────────────────────────────────────────────────────────────────────────
    // GET SOCIETE TERRITORIES
    // ─────────────────────────────────────────────────────────────────────────
    describe('GetSocieteTerritoriesService', () => {
        let service;
        beforeEach(() => {
            service = new getSocieteTerritories_service_1.GetSocieteTerritoriesService(societeRepository, mockLogger);
        });
        it('doit retourner les territoires de compétence', async () => {
            const mockTerritories = [{ id: 'ot-1', societeId: '1', territoryId: 'terr-1', isActive: true }];
            societeRepository.getSocieteTerritories.mockResolvedValueOnce(mockTerritories);
            const result = await service.getSocieteTerritories('1');
            expect(result).toEqual(mockTerritories);
            expect(mockLogger.info).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=societes.services.spec.js.map