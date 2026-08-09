import { TokenService } from "./token.types";
import jwt from 'jsonwebtoken'

/**
 * Service de gestion des JSON Web Tokens (JWT).
 * Gère la génération et la vérification des Access et Refresh tokens.
 */
export class TokenManager implements TokenService {

  constructor(
      private readonly accessTokenSecret: string = process.env.JWT_SECRET || ' ',
      private readonly refreshTokenSecret: string = process.env.REFRESH_SECRET || ' ',
      private readonly expiresAccessToken: string = process.env.EXPIRES_ACCESS_SECRET || '15m',
      private readonly expiresRefreshToken: string = process.env.EXPIRES_REFRESH_SECRET || '7d',
  ) {}

  /**
   * Génère un Access Token (courte durée).
   * @param payload Données à inclure dans le token
   */
  generateAccessToken(payload: Record<string, any>): string {
    return jwt.sign(
        payload,
        this.accessTokenSecret,
        { expiresIn: this.expiresAccessToken as any }
    )
  }

  /**
   * Génère un Refresh Token (longue durée).
   * @param payload Données optionnelles à inclure
   */
  generateRefreshToken(payload: Record<string, any> = {}): string {
    return jwt.sign(
        payload,
        this.refreshTokenSecret,
        { expiresIn: this.expiresRefreshToken as any }
    )
  }

  /**
   * Vérifie la validité d'un Access Token.
   */
  verifyAccessToken(token: string): any {
    return jwt.verify(token, this.accessTokenSecret)
  }

  /**
   * Vérifie la validité d'un Refresh Token.
   */
  verifyRefreshToken(token: string): any {
    return jwt.verify(token, this.refreshTokenSecret)
  }
}