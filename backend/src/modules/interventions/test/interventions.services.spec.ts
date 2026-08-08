import { Logger } from 'winston';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';
import { InterventionRepository } from '../repositories/intervention.repositories';

// Mock dependencies
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

jest.mock('../repositories/intervention.repositories');

// Services
import { GetInterventionsService } from '../services/getInterventions.service';
import { GetInterventionByIdService } from '../services/getInterventionById.service';
import { CreateInterventionService } from '../services/createIntervention.service';
import { UpdateInterventionService } from '../services/updateIntervention.service';
import { DeleteInterventionService } from '../services/deleteIntervention.service';
import { CreateFieldReportService } from '../services/createFieldReport.service';
import { GetInterventionReportsService } from '../services/getInterventionReports.service';

describe('Intervention Services', () => {
  let interventionRepository: jest.Mocked<InterventionRepository>;

  beforeEach(() => {
    interventionRepository = new InterventionRepository({} as any, mockLogger) as jest.Mocked<InterventionRepository>;
    jest.clearAllMocks();
  });

  describe('GetInterventionsService', () => {
    let service: GetInterventionsService;

    beforeEach(() => { service = new GetInterventionsService(interventionRepository, mockLogger); });

    it('doit retourner une liste paginée', async () => {
      const mockResult = { data: [{ id: '1', interventionType: 'cleaning', status: 'not_started' }], total: 1, page: 1, limit: 50, totalPages: 1 };
      interventionRepository.getAllInterventions.mockResolvedValueOnce(mockResult as any);

      const result = await service.getInterventions({ page: 1, limit: 50 });

      expect(result).toEqual(mockResult);
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('doit logger et propager l\'erreur', async () => {
      const error = new Error('DB error');
      interventionRepository.getAllInterventions.mockRejectedValueOnce(error);

      await expect(service.getInterventions()).rejects.toThrow('DB error');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('GetInterventionByIdService', () => {
    let service: GetInterventionByIdService;

    beforeEach(() => { service = new GetInterventionByIdService(interventionRepository, mockLogger); });

    it('doit retourner l\'intervention si trouvée', async () => {
      const mockIntervention = { id: '1', interventionType: 'cleaning', status: 'not_started' };
      interventionRepository.getInterventionById.mockResolvedValueOnce(mockIntervention as any);

      const result = await service.getInterventionById('1');

      expect(result).toEqual(mockIntervention);
    });

    it('doit lever NotFoundError si inexistante', async () => {
      interventionRepository.getInterventionById.mockResolvedValueOnce(null);

      await expect(service.getInterventionById('uuid-inexistant')).rejects.toThrow(NotFoundError);
    });
  });

  describe('CreateInterventionService', () => {
    let service: CreateInterventionService;

    beforeEach(() => { service = new CreateInterventionService(interventionRepository, mockLogger); });

    it('doit lever BadRequestError si champs requis absents', async () => {
      await expect(service.createIntervention({ missionId: '', assignedTeamId: '', interventionType: '' }))
        .rejects.toThrow(BadRequestError);
    });

    it('doit créer l\'intervention', async () => {
      const payload = { missionId: 'mission-1', assignedTeamId: 'team-1', interventionType: 'cleaning' };
      const mockCreated = { id: 'new-uuid', interventionType: 'cleaning', status: 'not_started' };
      interventionRepository.createIntervention.mockResolvedValueOnce(mockCreated as any);

      const result = await service.createIntervention(payload);

      expect(result).toEqual(mockCreated);
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('UpdateInterventionService', () => {
    let service: UpdateInterventionService;

    beforeEach(() => { service = new UpdateInterventionService(interventionRepository, mockLogger); });

    it('doit mettre à jour l\'intervention', async () => {
      const mockUpdated = { id: '1', interventionType: 'cleaning', status: 'started' };
      interventionRepository.updateIntervention.mockResolvedValueOnce(mockUpdated as any);

      const result = await service.updateIntervention('1', { status: 'started' as any });

      expect(result).toEqual(mockUpdated);
    });

    it('doit lever NotFoundError si inexistante', async () => {
      interventionRepository.updateIntervention.mockResolvedValueOnce(null);

      await expect(service.updateIntervention('uuid-inexistant', { status: 'started' as any }))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('DeleteInterventionService', () => {
    let service: DeleteInterventionService;

    beforeEach(() => { service = new DeleteInterventionService(interventionRepository, mockLogger); });

    it('doit supprimer l\'intervention', async () => {
      interventionRepository.deleteIntervention.mockResolvedValueOnce(undefined);

      await service.deleteIntervention('1');

      expect(interventionRepository.deleteIntervention).toHaveBeenCalledWith('1');
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('doit propager NotFoundError', async () => {
      const error = new NotFoundError('Intervention introuvable');
      interventionRepository.deleteIntervention.mockRejectedValueOnce(error);

      await expect(service.deleteIntervention('1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('CreateFieldReportService', () => {
    let service: CreateFieldReportService;

    beforeEach(() => { service = new CreateFieldReportService(interventionRepository, mockLogger); });

    it('doit lever BadRequestError si intervention absente', async () => {
      await expect(service.createFieldReport({ interventionId: '' })).rejects.toThrow(BadRequestError);
    });

    it('doit créer le rapport avec l\'auteur injecté', async () => {
      const mockReport = { id: 'r1', interventionId: '1', createdBy: 'user-1', completed: false };
      interventionRepository.createFieldReport.mockResolvedValueOnce(mockReport as any);

      const result = await service.createFieldReport({ interventionId: '1' }, { userId: 'user-1' });

      expect(interventionRepository.createFieldReport).toHaveBeenCalledWith(
        expect.objectContaining({ createdBy: 'user-1' })
      );
      expect(result).toEqual(mockReport);
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });

  describe('GetInterventionReportsService', () => {
    let service: GetInterventionReportsService;

    beforeEach(() => { service = new GetInterventionReportsService(interventionRepository, mockLogger); });

    it('doit retourner les rapports', async () => {
      const mockReports = [{ id: 'r1', interventionId: '1', createdBy: 'user-1', completed: true }];
      interventionRepository.getInterventionReports.mockResolvedValueOnce(mockReports as any);

      const result = await service.getInterventionReports('1');

      expect(result).toEqual(mockReports);
      expect(mockLogger.info).toHaveBeenCalled();
    });
  });
});