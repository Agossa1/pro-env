"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const login_controller_1 = require("../controller/login.controller");
const login_service_1 = require("../services/login.service");
jest.mock('../services/login.service');
describe('Auth Controllers', () => {
    describe('LoginController', () => {
        let loginController;
        let loginService;
        let mockReq;
        let mockRes;
        let mockNext;
        beforeEach(() => {
            loginService = new login_service_1.LoginService({}, {}, {}, {});
            loginController = new login_controller_1.LoginController(loginService);
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
            await loginController.login(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                message: 'Erreur de validation des données.'
            }));
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
            await loginController.login(mockReq, mockRes, mockNext);
            expect(loginService.login).toHaveBeenCalledWith('test@test.com', 'password123');
            expect(mockRes.cookie).toHaveBeenCalledWith('refreshToken', 'refresh-token', expect.objectContaining({
                httpOnly: true,
                sameSite: 'strict'
            }));
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: { user: mockResult.user, accessToken: 'access-token' }
            }));
        });
        it('doit passer l\'erreur à next() si le service échoue', async () => {
            mockReq.body = { email: 'test@test.com', password: 'password123' };
            const mockError = new Error('Service error');
            loginService.login.mockRejectedValueOnce(mockError);
            await loginController.login(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalledWith(mockError);
        });
    });
});
//# sourceMappingURL=auth.controllers.spec.js.map