"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const login_service_1 = require("../services/login.service");
const resend_code_service_1 = require("../services/resend-code.service");
const auth_repositories_1 = require("../repositories/auth.repositories");
const passwordServices_1 = require("@/config/passwords/passwordServices");
const tokenManager_1 = require("@/config/tokens/tokenManager");
const appErrors_1 = require("@/shared/errors/appErrors");
// Mock dependencies
const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
};
jest.mock('../repositories/auth.repositories');
jest.mock('@/config/passwords/passwordServices');
jest.mock('@/config/tokens/tokenManager');
// On mock authMailer pour éviter l'envoi de vrais emails pendant les tests
jest.mock('@/utils/mailer/authMailer', () => ({
    authMailer: {
        sendSigieOtp: jest.fn().mockResolvedValue(true)
    }
}));
describe('Auth Services', () => {
    let authRepository;
    let passwordService;
    let tokenManager;
    beforeEach(() => {
        authRepository = new auth_repositories_1.AuthRepository({}, mockLogger);
        passwordService = new passwordServices_1.PasswordService();
        tokenManager = new tokenManager_1.TokenManager();
        jest.clearAllMocks();
    });
    describe('LoginService', () => {
        let loginService;
        beforeEach(() => {
            loginService = new login_service_1.LoginService(authRepository, mockLogger, passwordService, tokenManager);
        });
        it('doit lever UnauthorizedError si l\'utilisateur n\'existe pas', async () => {
            authRepository.findAuthForLogin.mockResolvedValueOnce(null);
            await expect(loginService.login('wrong@email.com', 'password'))
                .rejects
                .toThrow(appErrors_1.UnauthorizedError);
        });
        it('doit lever ForbiddenError si le compte n\'est pas vérifié', async () => {
            authRepository.findAuthForLogin.mockResolvedValueOnce({
                id: 'uuid',
                isVerified: false,
                isActive: true,
                passwordHash: 'hash'
            });
            passwordService.comparePassword.mockResolvedValueOnce(true);
            await expect(loginService.login('test@email.com', 'password'))
                .rejects
                .toThrow(appErrors_1.ForbiddenError);
        });
        it('doit retourner les tokens et l\'utilisateur si tout est valide', async () => {
            const mockUser = {
                id: 'uuid',
                email: 'test@email.com',
                isVerified: true,
                isActive: true,
                passwordHash: 'hash',
                roleCode: 'ADMIN',
                roleTier: 1,
                territoryId: 'territory-uuid',
                organizationId: 'org-uuid'
            };
            authRepository.findAuthForLogin.mockResolvedValueOnce(mockUser);
            passwordService.comparePassword.mockResolvedValueOnce(true);
            tokenManager.generateAccessToken.mockReturnValueOnce('access-token');
            tokenManager.generateRefreshToken.mockReturnValueOnce('refresh-token');
            authRepository.createSession.mockResolvedValueOnce(undefined);
            const result = await loginService.login('test@email.com', 'password');
            expect(result.accessToken).toBe('access-token');
            expect(result.refreshToken).toBe('refresh-token');
            expect(result.user.passwordHash).toBeUndefined(); // Sécurité : mot de passe nettoyé
            expect(authRepository.createSession).toHaveBeenCalled();
        });
    });
    describe('ResendCodeService', () => {
        let resendCodeService;
        beforeEach(() => {
            resendCodeService = new resend_code_service_1.ResendCodeService(authRepository, mockLogger, passwordService);
        });
        it('doit lever BadRequestError si le compte est déjà vérifié', async () => {
            authRepository.findAuthByEmail.mockResolvedValueOnce({ id: 'uuid', email: 'test@test.com', fullName: 'Test' });
            authRepository.findAuthStatus.mockResolvedValueOnce({ isVerified: true, isActive: true });
            await expect(resendCodeService.resend('test@test.com'))
                .rejects
                .toThrow(appErrors_1.BadRequestError);
        });
        it('doit regénérer l\'OTP et sauvegarder si non vérifié', async () => {
            authRepository.findAuthByEmail.mockResolvedValueOnce({ id: 'uuid', email: 'test@test.com', fullName: 'Test' });
            authRepository.findAuthStatus.mockResolvedValueOnce({ isVerified: false, isActive: true });
            passwordService.hashPassword.mockResolvedValueOnce('hashed-otp');
            await resendCodeService.resend('test@test.com');
            expect(passwordService.hashPassword).toHaveBeenCalled();
            expect(authRepository.saveOtp).toHaveBeenCalledWith(expect.objectContaining({
                authId: 'uuid',
                codeHash: 'hashed-otp'
            }));
        });
    });
});
//# sourceMappingURL=auth.services.spec.js.map