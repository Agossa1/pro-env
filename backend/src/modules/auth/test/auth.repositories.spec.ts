import { AuthRepository } from '../repositories/auth.repositories';
import PostgresDatabase from '../../../config/database/postgres';
import { Logger } from 'winston';
import { redisCache } from '../../../infra/redis/redis.service';

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
  }
}));

describe('AuthRepository', () => {
  let authRepository: AuthRepository;
  let mockDb: jest.Mocked<PostgresDatabase>;

  beforeEach(() => {
    mockDb = new PostgresDatabase() as jest.Mocked<PostgresDatabase>;
    
    // Configurer le mock de query et getClient
    mockDb.query = jest.fn();
    mockDb.getClient = jest.fn().mockResolvedValue({
      query: jest.fn(),
      release: jest.fn(),
    });

    authRepository = new AuthRepository(mockDb, mockLogger);
    jest.clearAllMocks();
  });

  describe('getRoleByCode', () => {
    it('doit récupérer un rôle en utilisant le cache Redis', async () => {
      const mockRole = { id: 'uuid', code: 'ADMIN', name: 'Admin', tier: 1, canManageUsers: true };
      
      // Mocker redisCache.getOrSet pour simuler l'appel interne au callback
      (redisCache.getOrSet as jest.Mock).mockImplementation(async (key, factory) => {
        return await factory();
      });

      mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockRole] });

      const result = await authRepository.getRoleByCode('ADMIN');

      expect(redisCache.getOrSet).toHaveBeenCalledWith('auth:role:ADMIN', expect.any(Function), 86400);
      expect(mockDb.query).toHaveBeenCalledWith(expect.any(String), ['ADMIN']);
      expect(result).toEqual(mockRole);
    });
  });

  describe('checkUserExistence', () => {
    it('doit retourner exists: true si l\'email est déjà pris', async () => {
      const existingUser = { id: 'uuid1', email: 'test@test.com', phone: null };
      mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [existingUser] });

      const result = await authRepository.checkUserExistence('test@test.com');
      
      expect(result).toEqual({ exists: true, reason: 'Un compte existe déjà avec cet email.' });
    });

    it('doit retourner exists: false si aucune erreur n\'est levée', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      const result = await authRepository.checkUserExistence('test@test.com');
      
      expect(result).toEqual({ exists: false });
    });
  });

  describe('Sessions', () => {
    it('doit créer une session', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [] });

      const payload = { authId: 'uuid', token: 'token-xyz', expiresAt: new Date() };
      await authRepository.createSession(payload);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO sessions'),
        [payload.authId, payload.token, payload.expiresAt]
      );
    });

    it('doit supprimer une session', async () => {
      mockDb.query.mockResolvedValueOnce({ rowCount: 1, rows: [] });

      await authRepository.deleteSession('token-xyz');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM sessions WHERE token'),
        ['token-xyz']
      );
    });
  });
});
