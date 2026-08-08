import { ReportRepository } from '../repositories/report.repositories';
import PostgresDatabase from '../../../config/database/postgres';
import { Logger } from 'winston';
import { redisCache } from '../../../infra/redis/redis.service';
import { BadRequestError, NotFoundError } from '../../../shared/errors/appErrors';

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

describe('ReportRepository', () => {
  let reportRepository: ReportRepository;
  let mockDb: jest.Mocked<PostgresDatabase>;
  let mockClient: { query: jest.Mock; release: jest.Mock };

  const mockReport = {
    id: 'report-1',
    territoryId: 'terr-1',
    infrastructureId: null,
    mappedAreaId: null,
    title: 'Caniveau bouché',
    description: 'Obstruction au centre-ville',
    issueCategory: 'drainage',
    priority: 'high',
    riskLevel: 'medium',
    status: 'submitted',
    latitude: 6.36,
    longitude: 2.42,
    createdBy: 'user-1',
    reportedAt: new Date(),
    assignedTo: null,
    resolvedAt: null,
    slaHours: 48,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    mockDb = new PostgresDatabase() as jest.Mocked<PostgresDatabase>;

    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    mockDb.query = jest.fn();
    mockDb.getClient = jest.fn().mockResolvedValue(mockClient);

    reportRepository = new ReportRepository(mockDb, mockLogger);
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // REPORTS — CRUD
  // ─────────────────────────────────────────────────────────────────────────

  describe('getAllReports', () => {
    it('doit retourner une liste paginée avec total et totalPages', async () => {
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());

      mockDb.query
        .mockResolvedValueOnce({ rows: [{ total: 25 }] }) // count
        .mockResolvedValueOnce({ rows: [mockReport] }); // data

      const result = await reportRepository.getAllReports({ page: 1, limit: 10 });

      expect(result.total).toBe(25);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(3);
      expect(result.data).toHaveLength(1);
    });

    it('doit appliquer les filtres territoire/statut/catégorie', async () => {
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());

      mockDb.query
        .mockResolvedValueOnce({ rows: [{ total: 3 }] })
        .mockResolvedValueOnce({ rows: [mockReport] });

      await reportRepository.getAllReports({
        territoryId: 'terr-1',
        status: 'submitted',
        issueCategory: 'drainage',
      });

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('r.territory_id = $1'),
        expect.arrayContaining(['terr-1'])
      );
    });
  });

  describe('getReportById', () => {
    it('doit retourner le rapport si trouvé', async () => {
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());
      mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockReport] });

      const result = await reportRepository.getReportById('report-1');

      expect(result).toEqual(mockReport);
    });

    it('doit retourner null si non trouvé', async () => {
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());
      mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const result = await reportRepository.getReportById('uuid-inexistant');

      expect(result).toBeNull();
    });
  });

  describe('createReport', () => {
    const payload = {
      territoryId: 'terr-1',
      title: 'Caniveau bouché',
      issueCategory: 'drainage' as any,
      createdBy: 'user-1',
    };

    it('doit créer un rapport dans une transaction et invalider le cache', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [mockReport] }) // INSERT reports
        .mockResolvedValueOnce(undefined); // COMMIT

      const result = await reportRepository.createReport(payload);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO reports'), expect.any(Array));
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(redisCache.invalidatePattern).toHaveBeenCalledWith('reports:all:*');
      expect(mockClient.release).toHaveBeenCalled();
      expect(result).toEqual(mockReport);
    });

    it('doit insérer le détail 1:1 selon la catégorie', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [mockReport] }) // INSERT reports
        .mockResolvedValueOnce({ rowCount: 1 }) // INSERT report_details_drainage
        .mockResolvedValueOnce(undefined); // COMMIT

      await reportRepository.createReport({
        ...payload,
        details: { blockageLevelPct: 80, waterLevelCm: 30, flowStatus: 'blocked' as any },
      });

      expect(mockClient.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO report_details_drainage'),
        expect.arrayContaining(['report-1'])
      );
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('doit faire ROLLBACK et lever BadRequestError si FK violation', async () => {
      const fkError = { code: '23503', message: 'fk violation' };
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockRejectedValueOnce(fkError);

      await expect(reportRepository.createReport(payload)).rejects.toThrow(BadRequestError);
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('updateReport', () => {
    it('doit mettre à jour et invalider les caches', async () => {
      const mockUpdated = { ...mockReport, title: 'Nouveau titre' };
      mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockUpdated] });

      const result = await reportRepository.updateReport('report-1', { title: 'Nouveau titre' });

      expect(result).toEqual(mockUpdated);
      expect(redisCache.invalidate).toHaveBeenCalledWith('report:id:report-1');
    });

    it('doit lever NotFoundError si non trouvé', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      await expect(reportRepository.updateReport('uuid-inexistant', { title: 'X' }))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteReport', () => {
    it('doit faire une suppression logique', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 1 });

      await reportRepository.deleteReport('report-1');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE reports SET deleted_at'),
        ['report-1']
      );
      expect(redisCache.invalidate).toHaveBeenCalledWith('report:id:report-1');
    });

    it('doit lever NotFoundError si non trouvé', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      await expect(reportRepository.deleteReport('uuid-inexistant')).rejects.toThrow(NotFoundError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // EXTENSIONS 1:1 + HISTORIQUE
  // ─────────────────────────────────────────────────────────────────────────

  describe('getReportDetails', () => {
    it('doit retourner le détail selon la catégorie', async () => {
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());
      mockDb.query
        .mockResolvedValueOnce({ rowCount: 1, rows: [mockReport] }) // getReportById
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ report_id: 'report-1', blockage_level_pct: 80 }] });

      const result = await reportRepository.getReportDetails('report-1');

      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('report_details_drainage'), ['report-1']);
      expect(result).toEqual({ report_id: 'report-1', blockage_level_pct: 80 });
    });

    it('doit retourner null si le rapport est introuvable', async () => {
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());
      mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const result = await reportRepository.getReportDetails('uuid-inexistant');

      expect(result).toBeNull();
    });
  });

  describe('getReportStatusHistory', () => {
    it('doit retourner l\'historique des statuts', async () => {
      const mockHistory = [
        { id: 'h1', reportId: 'report-1', oldStatus: null, newStatus: 'submitted', changedBy: 'user-1', createdAt: new Date() },
      ];
      mockDb.query.mockResolvedValueOnce({ rows: mockHistory });

      const result = await reportRepository.getReportStatusHistory('report-1');

      expect(result).toEqual(mockHistory);
    });
  });
});