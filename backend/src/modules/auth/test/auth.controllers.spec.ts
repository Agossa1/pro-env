import { LoginController } from '../controller/login.controller';
import { LoginService } from '../services/login.service';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

jest.mock('../services/login.service');

describe('Auth Controllers', () => {
  describe('LoginController', () => {
    let loginController: LoginController;
    let loginService: jest.Mocked<LoginService>;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      loginService = new LoginService({} as any, {} as any, {} as any, {} as any) as jest.Mocked<LoginService>;
      loginController = new LoginController(loginService);

      mockReq = {
        body: {}
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn()
      };
      mockNext = jest.fn();
    });

    it('doit renvoyer une erreur 400 si l\'email est invalide (Zod validation)', async () => {
      mockReq.body = { email: 'not-an-email', password: 'password123' };

      await loginController.login(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'Erreur de validation des données.'
        })
      );
      expect(loginService.login).not.toHaveBeenCalled();
    });

    it('doit appeler le service et renvoyer 200 avec cookie si succès', async () => {
      mockReq.body = { email: 'test@test.com', password: 'password123' };
      
      const mockResult = {
        user: { id: 'uuid', email: 'test@test.com' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      };
      loginService.login.mockResolvedValueOnce(mockResult);

      await loginController.login(mockReq as Request, mockRes as Response, mockNext);

      expect(loginService.login).toHaveBeenCalledWith('test@test.com', 'password123');
      expect(mockRes.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token', expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax'
      }));
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: { user: mockResult.user, accessToken: 'access-token' }
        })
      );
    });

    it('doit passer l\'erreur à next() si le service échoue', async () => {
      mockReq.body = { email: 'test@test.com', password: 'password123' };
      const mockError = new Error('Service error');
      
      loginService.login.mockRejectedValueOnce(mockError);

      await loginController.login(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });
});
