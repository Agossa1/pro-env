"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisCache = exports.RedisCacheService = void 0;
// TODO: Implémenter
const redis_config_1 = __importDefault(require("./redis.config"));
const logger_1 = require("@/config/loggers/logger");
const DEFAULT_TTL = 300; // 5 minutes par défaut
/**
 * Service de cache Redis pour les données lues fréquemment.
 * Utilisé pour réduire la charge sur PostgreSQL et accélérer les réponses.
 */
class RedisCacheService {
    /**
     * Récupère une valeur du cache ou exécute la fonction factory si absente.
     * Pattern Cache-Aside : vérifie Redis d'abord, puis DB si absent.
     *
     * @param key - Clé de cache (ex: 'reports:list:municipality:123')
     * @param factory - Fonction à exécuter si la clé n'existe pas en cache
     * @param ttl - Durée de vie en secondes (défaut: 300 = 5 minutes)
     */
    async getOrSet(key, factory, ttl = DEFAULT_TTL) {
        try {
            if (!redis_config_1.default.isOpen) {
                return factory();
            }
            const cached = await redis_config_1.default.get(key);
            if (cached) {
                logger_1.logger.debug(`[Redis] Cache HIT: ${key}`);
                return JSON.parse(cached);
            }
            logger_1.logger.debug(`[Redis] Cache MISS: ${key}`);
            const data = await factory();
            // Stocker en cache (async, ne pas bloquer la réponse)
            redis_config_1.default.setEx(key, ttl, JSON.stringify(data)).catch(err => logger_1.logger.warn(`[Redis] Erreur setEx ${key}:`, err));
            return data;
        }
        catch (error) {
            logger_1.logger.warn(`[Redis] Erreur cache ${key}:`, error);
            return factory();
        }
    }
    /**
     * Invalide une clé de cache.
     */
    async invalidate(key) {
        try {
            if (redis_config_1.default.isOpen) {
                await redis_config_1.default.del(key);
            }
        }
        catch (error) {
            logger_1.logger.warn(`[Redis] Erreur invalidate ${key}:`, error);
        }
    }
    /**
     * Invalide toutes les clés correspondant à un pattern.
     * Ex: 'reports:*' pour vider tout le cache reports.
     */
    async invalidatePattern(pattern) {
        try {
            if (!redis_config_1.default.isOpen)
                return;
            const keys = await redis_config_1.default.keys(pattern);
            if (keys.length > 0) {
                await redis_config_1.default.del(keys);
                logger_1.logger.debug(`[Redis] Invalidé ${keys.length} clés (pattern: ${pattern})`);
            }
        }
        catch (error) {
            logger_1.logger.warn(`[Redis] Erreur invalidatePattern ${pattern}:`, error);
        }
    }
}
exports.RedisCacheService = RedisCacheService;
exports.redisCache = new RedisCacheService();
//# sourceMappingURL=redis.service.js.map