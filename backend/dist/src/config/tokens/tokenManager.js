"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenManager = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Service de gestion des JSON Web Tokens (JWT).
 * Gère la génération et la vérification des Access et Refresh tokens.
 */
class TokenManager {
    accessTokenSecret;
    refreshTokenSecret;
    expiresAccessToken;
    expiresRefreshToken;
    constructor(accessTokenSecret = process.env.JWT_SECRET || ' ', refreshTokenSecret = process.env.REFRESH_SECRET || ' ', expiresAccessToken = process.env.EXPIRES_ACCESS_SECRET || '15m', expiresRefreshToken = process.env.EXPIRES_REFRESH_SECRET || '7d') {
        this.accessTokenSecret = accessTokenSecret;
        this.refreshTokenSecret = refreshTokenSecret;
        this.expiresAccessToken = expiresAccessToken;
        this.expiresRefreshToken = expiresRefreshToken;
    }
    /**
     * Génère un Access Token (courte durée).
     * @param payload Données à inclure dans le token
     */
    generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.accessTokenSecret, { expiresIn: this.expiresAccessToken });
    }
    /**
     * Génère un Refresh Token (longue durée).
     * @param payload Données optionnelles à inclure
     */
    generateRefreshToken(payload = {}) {
        return jsonwebtoken_1.default.sign(payload, this.refreshTokenSecret, { expiresIn: this.expiresRefreshToken });
    }
    /**
     * Vérifie la validité d'un Access Token.
     */
    verifyAccessToken(token) {
        return jsonwebtoken_1.default.verify(token, this.accessTokenSecret);
    }
    /**
     * Vérifie la validité d'un Refresh Token.
     */
    verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, this.refreshTokenSecret);
    }
}
exports.TokenManager = TokenManager;
//# sourceMappingURL=tokenManager.js.map