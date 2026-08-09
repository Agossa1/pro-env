"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const appErrors_1 = require("../../../shared/errors/appErrors");
const intervention_repositories_1 = require("../repositories/intervention.repositories");
// Mock dependencies
const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
};
jest.mock('../repositories/intervention.repositories');
// Services
const getInterventions_service_1 = require("../services/getInterventions.service");
const getInterventionById_service_1 = require("../services/getInterventionById.service");
const createIntervention_service_1 = require("../services/createIntervention.service");
const updateIntervention_service_1 = require("../services/updateIntervention.service");
const deleteIntervention_service_1 = require("../services/deleteIntervention.service");
const createFieldReport_service_1 = require("../services/createFieldReport.service");
const getInterventionReports_service_1 = require("../services/getInterventionReports.service");
describe('Intervention Services', () => {
    let interventionRepository;
    beforeEach(() => {
        interventionRepository = new intervention_repositories_1.InterventionRepository({}, mockLogger);
        jest.clearAllMocks();
    });
    describe('GetInterventionsService', () => {
        let service;
        beforeEach(() => { service = new getInterventions_service_1.GetInterventionsService(interventionRepository, mockLogger); });
        it('doit retourner une liste paginée', async () => {
            const mockResult = { data: [{ id: '1', interventionType: 'cleaning', status: 'not_started' }], total: 1, page: 1, limit: 50, totalPages: 1 };
            interventionRepository.getAllInterventions.mockResolvedValueOnce(mockResult);
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
        let service;
        beforeEach(() => { service = new getInterventionById_service_1.GetInterventionByIdService(interventionRepository, mockLogger); });
        it('doit retourner l\'intervention si trouvée', async () => {
            const mockIntervention = { id: '1', interventionType: 'cleaning', status: 'not_started' };
            interventionRepository.getInterventionById.mockResolvedValueOnce(mockIntervention);
            const result = await service.getInterventionById('1');
            expect(result).toEqual(mockIntervention);
        });
        it('doit lever NotFoundError si inexistante', async () => {
            interventionRepository.getInterventionById.mockResolvedValueOnce(null);
            await expect(service.getInterventionById('uuid-inexistant')).rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    describe('CreateInterventionService', () => {
        let service;
        beforeEach(() => { service = new createIntervention_service_1.CreateInterventionService(interventionRepository, mockLogger); });
        it('doit lever BadRequestError si champs requis absents', async () => {
            await expect(service.createIntervention({ missionId: '', assignedTeamId: '', interventionType: '' }))
                .rejects.toThrow(appErrors_1.BadRequestError);
        });
        it('doit créer l\'intervention', async () => {
            const payload = { missionId: 'mission-1', assignedTeamId: 'team-1', interventionType: 'cleaning' };
            const mockCreated = { id: 'new-uuid', interventionType: 'cleaning', status: 'not_started' };
            interventionRepository.createIntervention.mockResolvedValueOnce(mockCreated);
            const result = await service.createIntervention(payload);
            expect(result).toEqual(mockCreated);
            expect(mockLogger.info).toHaveBeenCalled();
        });
    });
    describe('UpdateInterventionService', () => {
        let service;
        beforeEach(() => { service = new updateIntervention_service_1.UpdateInterventionService(interventionRepository, mockLogger); });
        it('doit mettre à jour l\'intervention', async () => {
            const mockUpdated = { id: '1', interventionType: 'cleaning', status: 'started' };
            interventionRepository.updateIntervention.mockResolvedValueOnce(mockUpdated);
            const result = await service.updateIntervention('1', { status: 'started' });
            expect(result).toEqual(mockUpdated);
        });
        it('doit lever NotFoundError si inexistante', async () => {
            interventionRepository.updateIntervention.mockResolvedValueOnce(null);
            await expect(service.updateIntervention('uuid-inexistant', { status: 'started' }))
                .rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    describe('DeleteInterventionService', () => {
        let service;
        beforeEach(() => { service = new deleteIntervention_service_1.DeleteInterventionService(interventionRepository, mockLogger); });
        it('doit supprimer l\'intervention', async () => {
            interventionRepository.deleteIntervention.mockResolvedValueOnce(undefined);
            await service.deleteIntervention('1');
            expect(interventionRepository.deleteIntervention).toHaveBeenCalledWith('1');
            expect(mockLogger.info).toHaveBeenCalled();
        });
        it('doit propager NotFoundError', async () => {
            const error = new appErrors_1.NotFoundError('Intervention introuvable');
            interventionRepository.deleteIntervention.mockRejectedValueOnce(error);
            await expect(service.deleteIntervention('1')).rejects.toThrow(appErrors_1.NotFoundError);
        });
    });
    describe('CreateFieldReportService', () => {
        let service;
        beforeEach(() => { service = new createFieldReport_service_1.CreateFieldReportService(interventionRepository, mockLogger); });
        it('doit lever BadRequestError si intervention absente', async () => {
            await expect(service.createFieldReport({ interventionId: '' })).rejects.toThrow(appErrors_1.BadRequestError);
        });
        it('doit créer le rapport avec l\'auteur injecté', async () => {
            const mockReport = { id: 'r1', interventionId: '1', createdBy: 'user-1', completed: false };
            interventionRepository.createFieldReport.mockResolvedValueOnce(mockReport);
            const result = await service.createFieldReport({ interventionId: '1' }, { userId: 'user-1' });
            expect(interventionRepository.createFieldReport).toHaveBeenCalledWith(expect.objectContaining({ createdBy: 'user-1' }));
            expect(result).toEqual(mockReport);
            expect(mockLogger.info).toHaveBeenCalled();
        });
    });
    describe('GetInterventionReportsService', () => {
        let service;
        beforeEach(() => { service = new getInterventionReports_service_1.GetInterventionReportsService(interventionRepository, mockLogger); });
        it('doit retourner les rapports', async () => {
            const mockReports = [{ id: 'r1', interventionId: '1', createdBy: 'user-1', completed: true }];
            interventionRepository.getInterventionReports.mockResolvedValueOnce(mockReports);
            const result = await service.getInterventionReports('1');
            expect(result).toEqual(mockReports);
            expect(mockLogger.info).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=interventions.services.spec.js.map