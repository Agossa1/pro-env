// TODO: Implémenter
export interface TokenService {
    generateAccessToken(payload: Record<string, any>): string;
    generateRefreshToken(payload?: Record<string, any>): string;
    verifyAccessToken(token: string): any
    verifyRefreshToken(token: string): any
}

