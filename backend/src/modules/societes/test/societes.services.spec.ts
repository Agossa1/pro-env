import { Logger } from 'winston';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';
import { SocieteRepository } from '../repositories/societe.repositories';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

jest.mock('../repositories/societe.repositories');

// Services
import { GetSocietesService } from '../services/getSocietes.service';
import { GetSocieteByIdService } from '../services/getSocieteById.service';
import { GetSocieteByRegistrationNumberService } from '../services/getSocieteByRegistrationNumber.service';
import { CreateSocieteService } from '../services/createSociete.service';
import { CreateSocieteAccountService } from '../services/createSocieteAccount.service';
import { UpdateSocieteService } from '../services/updateSociete.service';
import { DeleteSocieteService } from '../services/deleteSociete.service';
import { GetSocieteTerritoriesService } from '../services/getSocieteTerritories.service';

describe('Societe Services', () => {
  let societeRepository: jest.Mocked<SocieteRepository>;

  beforeEach(() => {
    societeRepository = new SocieteRepository({} as any, mockLogger) as jest.Mocked<SocieteRepository>;
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET SOCIETES
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetSocietesService', () => {
    let service: GetSocietesService;

    beforeEach(() => {
      service = new GetSocietesService(societeRepository, mockLogger);
    });

    it('doit retourner une liste paginée', async () => {
      const mockResult = {
        data: [{ id: '1', name: 'BTP Bénin', type: 'PRIVATE_COMPANY' }],
        total: 1, page: 1, limit: 50, totalPages: 1,
      };
      societeRepository.getAllSocietes.mockResolvedValueOnce(mockResult as any);

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
    let service: GetSocieteByIdService;

    beforeEach(() => {
      service = new GetSocieteByIdService(societeRepository, mockLogger);
    });

    it('doit retourner la société si trouvée', async () => {
      const mockSociete = { id: '1', name: 'BTP Bénin', type: 'PRIVATE_COMPANY' };
      societeRepository.getSocieteById.mockResolvedValueOnce(mockSociete as any);

      const result = await service.getSocieteById('1');

      expect(result).toEqual(mockSociete);
    });

    it('doit lever NotFoundError si inexistante', async () => {
      societeRepository.getSocieteById.mockResolvedValueOnce(null);

      await expect(service.getSocieteById('uuid-inexistant')).rejects.toThrow(NotFoundError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET SOCIETE BY REGISTRATION NUMBER
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetSocieteByRegistrationNumberService', () => {
    let service: GetSocieteByRegistrationNumberService;

    beforeEach(() => {
      service = new GetSocieteByRegistrationNumberService(societeRepository, mockLogger);
    });

    it('doit retourner la société si trouvée', async () => {
      const mockSociete = { id: '1', name: 'BTP Bénin', type: 'PRIVATE_COMPANY' };
      societeRepository.getSocieteByRegistrationNumber.mockResolvedValueOnce(mockSociete as any);

      const result = await service.getSocieteByRegistrationNumber('RCCM-001');

      expect(result).toEqual(mockSociete);
    });

    it('doit lever NotFoundError si non trouvée', async () => {
      societeRepository.getSocieteByRegistrationNumber.mockResolvedValueOnce(null);

      await expect(service.getSocieteByRegistrationNumber('INEXISTANT'))
        .rejects.toThrow(NotFoundError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CREATE SOCIETE
  // ─────────────────────────────────────────────────────────────────────────

  describe('CreateSocieteService', () => {
    let service: CreateSocieteService;

    beforeEach(() => {
      service = new CreateSocieteService(
        societeRepository,
        mockLogger,
        { createSocieteAccount: jest.fn() } as unknown as CreateSocieteAccountService,
      );
    });

    it('doit lever BadRequestError si nom/type absents', async () => {
      await expect(service.createSociete({ name: '', type: '' as any }))
        .rejects.toThrow(BadRequestError);
    });

    it('doit lever BadRequestError si n° d\'enregistrement déjà utilisé', async () => {
      societeRepository.getSocieteByRegistrationNumber.mockResolvedValueOnce({
        id: '1', name: 'Existant', type: 'PRIVATE_COMPANY',
      } as any);

      await expect(service.createSociete({
        name: 'Nouveau', type: 'PRIVATE_COMPANY' as any, registrationNumber: 'RCCM-001',
      })).rejects.toThrow(BadRequestError);
    });

    it('doit créer la société avec succès', async () => {
      societeRepository.getSocieteByRegistrationNumber.mockResolvedValueOnce(null);
      const mockCreated = { id: 'new-uuid', name: 'BTP Bénin', type: 'PRIVATE_COMPANY' };
      societeRepository.createSociete.mockResolvedValueOnce(mockCreated as any);

      const result = await service.createSociete({ name: 'BTP Bénin', type: 'PRIVATE_COMPANY' as any, contactEmail: 'contact@btpbenin.bj' });

      expect(result).toEqual(mockCreated);
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('doit associer la société au territoire du créateur (mairie/ministère)', async () => {
      societeRepository.getSocieteByRegistrationNumber.mockResolvedValueOnce(null);
      const mockCreated = { id: 'new-uuid', name: 'BTP Bénin', type: 'PRIVATE_COMPANY' };
      societeRepository.createSociete.mockResolvedValueOnce(mockCreated as any);

      await service.createSociete(
        { name: 'BTP Bénin', type: 'PRIVATE_COMPANY' as any, contactEmail: 'contact@btpbenin.bj' },
        { userId: 'user-1', territoryId: 'mairie-uuid' }
      );

      expect(societeRepository.createSociete).toHaveBeenCalledWith(
        expect.objectContaining({ territoryId: 'mairie-uuid' })
      );
    });

    it('doit utiliser le territoryId fourni par l\'admin (association libre)', async () => {
      societeRepository.getSocieteByRegistrationNumber.mockResolvedValueOnce(null);
      const mockCreated = { id: 'new-uuid', name: 'BTP Bénin', type: 'PRIVATE_COMPANY' };
      societeRepository.createSociete.mockResolvedValueOnce(mockCreated as any);

      await service.createSociete(
        { name: 'BTP Bénin', type: 'PRIVATE_COMPANY' as any, contactEmail: 'contact@btpbenin.bj', territoryId: 'ministere-uuid' },
        { userId: 'admin-1', territoryId: null }
      );

      expect(societeRepository.createSociete).toHaveBeenCalledWith(
        expect.objectContaining({ territoryId: 'ministere-uuid' })
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE SOCIETE
  // ─────────────────────────────────────────────────────────────────────────

  describe('UpdateSocieteService', () => {
    let service: UpdateSocieteService;

    beforeEach(() => {
      service = new UpdateSocieteService(societeRepository, mockLogger);
    });

    it('doit mettre à jour la société', async () => {
      const mockUpdated = { id: '1', name: 'New Name', type: 'PRIVATE_COMPANY' };
      societeRepository.updateSociete.mockResolvedValueOnce(mockUpdated as any);

      const result = await service.updateSociete('1', { name: 'New Name' });

      expect(result).toEqual(mockUpdated);
    });

    it('doit lever NotFoundError si inexistante', async () => {
      societeRepository.updateSociete.mockResolvedValueOnce(null);

      await expect(service.updateSociete('uuid-inexistant', { name: 'X' }))
        .rejects.toThrow(NotFoundError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE SOCIETE
  // ─────────────────────────────────────────────────────────────────────────

  describe('DeleteSocieteService', () => {
    let service: DeleteSocieteService;

    beforeEach(() => {
      service = new DeleteSocieteService(societeRepository, mockLogger);
    });

    it('doit supprimer la société', async () => {
      societeRepository.deleteSociete.mockResolvedValueOnce(undefined);

      await service.deleteSociete('1');

      expect(societeRepository.deleteSociete).toHaveBeenCalledWith('1');
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('doit propager BadRequestError si références existantes', async () => {
      const error = new BadRequestError('Références existantes');
      societeRepository.deleteSociete.mockRejectedValueOnce(error);

      await expect(service.deleteSociete('1')).rejects.toThrow(BadRequestError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET SOCIETE TERRITORIES
  // ─────────────────────────────────────────────────────────────────────────

  describe('GetSocieteTerritoriesService', () => {
    let service: GetSocieteTerritoriesService;

    beforeEach(() => {
      service = new GetSocieteTerritoriesService(societeRepository, mockLogger);
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