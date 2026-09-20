import { TerritoryRepository } from '../repositories/territory.repositories';
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

describe('TerritoryRepository', () => {
  let territoryRepository: TerritoryRepository;
  let mockDb: jest.Mocked<PostgresDatabase>;
  let mockClient: { query: jest.Mock; release: jest.Mock };

  beforeEach(() => {
    mockDb = new PostgresDatabase() as jest.Mocked<PostgresDatabase>;

    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };

    mockDb.query = jest.fn();
    mockDb.getClient = jest.fn().mockResolvedValue(mockClient);

    territoryRepository = new TerritoryRepository(mockDb, mockLogger);
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TERRITORY TYPES
  // ─────────────────────────────────────────────────────────────────────────

  describe('getAllTerritoryTypes', () => {
    it('doit retourner une liste vide (deprecated)', async () => {
      const result = await territoryRepository.getAllTerritoryTypes({ page: 1, limit: 10 });
      expect(result.total).toBe(0);
      expect(result.data).toHaveLength(0);
    });
  });

  describe('getTerritoryTypeByCode', () => {
    it('doit retourner null (deprecated)', async () => {
      const result = await territoryRepository.getTerritoryTypeByCode('DEPARTMENT');
      expect(result).toBeNull();
    });

    it('doit retourner null si non trouvé', async () => {
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());
      mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const result = await territoryRepository.getTerritoryTypeByCode('INEXISTANT');

      expect(result).toBeNull();
    });
  });

  describe('getTerritoryTypeById', () => {
    it('doit retourner null (deprecated)', async () => {
      const result = await territoryRepository.getTerritoryTypeById('uuid-1');
      expect(result).toBeNull();
    });

    it('doit retourner null si non trouvé', async () => {
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());
      mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const result = await territoryRepository.getTerritoryTypeById('uuid-inexistant');

      expect(result).toBeNull();
    });
  });

  describe('createTerritoryType', () => {
    const payload = { code: 'PROVINCE', name: 'Province', hierarchyLevel: 2 };

    it('doit lever BadRequestError car non supporté (4-tier model)', async () => {
      await expect(territoryRepository.createTerritoryType(payload)).rejects.toThrow(BadRequestError);
    });
  });

  describe('updateTerritoryType', () => {
    it('doit lever BadRequestError car non supporté (4-tier model)', async () => {
      await expect(territoryRepository.updateTerritoryType('uuid-1', { name: 'New Name' }))
        .rejects.toThrow(BadRequestError);
    });
  });

  describe('deleteTerritoryType', () => {
    it('doit lever BadRequestError car non supporté (4-tier model)', async () => {
      await expect(territoryRepository.deleteTerritoryType('uuid-1'))
        .rejects.toThrow(BadRequestError);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // TERRITORIES
  // ─────────────────────────────────────────────────────────────────────────

  describe('getTerritoryById', () => {
    it('doit retourner le territoire avec géométries GeoJSON', async () => {
      const mockTerritory = {
        id: 'uuid-t',
        territoryTypeId: 'uuid-tt',
        name: 'Cotonou',
        code: 'BJ-LI-CO',
        geometry: '{"type":"MultiPolygon","coordinates":[]}',
      };
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());
      mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockTerritory] });

      const result = await territoryRepository.getTerritoryById('uuid-t');

      expect(result).toEqual(mockTerritory);
    });

    it('doit retourner null si non trouvé', async () => {
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());
      mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const result = await territoryRepository.getTerritoryById('uuid-inexistant');

      expect(result).toBeNull();
    });
  });

  describe('existsTerritoryByCode', () => {
    it('doit retourner true si le code existe', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 1 });

      const exists = await territoryRepository.existsTerritoryByCode('BJ-LI-CO');

      expect(exists).toBe(true);
    });

    it('doit retourner false si le code n\'existe pas', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 0 });

      const exists = await territoryRepository.existsTerritoryByCode('INEXISTANT');

      expect(exists).toBe(false);
    });
  });

  describe('getTerritoryByCode', () => {
    it('doit retourner le territoire par code', async () => {
      const mockTerritory = { id: 'uuid-t', code: 'BJ-LI-CO', name: 'Cotonou' };
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());
      mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockTerritory] });

      const result = await territoryRepository.getTerritoryByCode('BJ-LI-CO');

      expect(result).toEqual(mockTerritory);
    });

    it('doit retourner null si code non trouvé', async () => {
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());
      mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const result = await territoryRepository.getTerritoryByCode('INEXISTANT');

      expect(result).toBeNull();
    });
  });

  describe('getAllTerritories', () => {
    it('doit retourner une liste paginée avec filtres optionnels', async () => {
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (_key, factory) => factory());

      mockDb.query
        .mockResolvedValueOnce({ rows: [{ total: 10 }] }) // count
        .mockResolvedValueOnce({ rows: [{ id: '1', name: 'Cotonou' }] });

      const result = await territoryRepository.getAllTerritories({
        page: 1,
        limit: 50,
        territoryTypeId: 'type-uuid',
      });

      expect(result.total).toBe(10);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('createTerritory', () => {
    const payload = {
      territoryTypeId: 'type-uuid',
      name: 'Test Territory',
      code: 'BJ-TEST',
      geometry: { type: 'MultiPolygon', coordinates: [] },
      status: 'ACTIVE' as any,
    };

    it('doit lever BadRequestError car non supporté (4-tier model)', async () => {
      await expect(territoryRepository.createTerritory(payload)).rejects.toThrow(BadRequestError);
    });
  });
});