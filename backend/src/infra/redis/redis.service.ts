// TODO: Implémenter
import client from './redis.config';
import { logger } from '../../config/loggers/logger';

const DEFAULT_TTL = 300; // 5 minutes par défaut

/**
 * Service de cache Redis pour les données lues fréquemment.
 * Utilisé pour réduire la charge sur PostgreSQL et accélérer les réponses.
 */
export class RedisCacheService {
    /**
     * Récupère une valeur du cache ou exécute la fonction factory si absente.
     * Pattern Cache-Aside : vérifie Redis d'abord, puis DB si absent.
     *
     * @param key - Clé de cache (ex: 'reports:list:municipality:123')
     * @param factory - Fonction à exécuter si la clé n'existe pas en cache
     * @param ttl - Durée de vie en secondes (défaut: 300 = 5 minutes)
     */
    async getOrSet<T>(key: string, factory: () => Promise<T>, ttl: number = DEFAULT_TTL): Promise<T> {
        try {
            // isReady (et non isOpen) : pendant une tentative de reconnexion Redis,
            // la commande resterait en file d'attente et bloquerait la requête.
            if (!client.isReady) {
                return factory();
            }

            const cached = await client.get(key);
            if (cached) {
                logger.debug(`[Redis] Cache HIT: ${key}`);
                return JSON.parse(cached);
            }

            logger.debug(`[Redis] Cache MISS: ${key}`);
            const data = await factory();

            // Stocker en cache (async, ne pas bloquer la réponse)
            client.setEx(key, ttl, JSON.stringify(data)).catch(err =>
                logger.warn(`[Redis] Erreur setEx ${key}:`, err)
            );

            return data;
        } catch (error) {
            logger.warn(`[Redis] Erreur cache ${key}:`, error);
            return factory();
        }
    }

    /**
     * Invalide une clé de cache.
     */
    async invalidate(key: string): Promise<void> {
        try {
            if (client.isReady) {
                await client.del(key);
            }
        } catch (error) {
            logger.warn(`[Redis] Erreur invalidate ${key}:`, error);
        }
    }

    /**
     * Invalide toutes les clés correspondant à un pattern.
     * Ex: 'reports:*' pour vider tout le cache reports.
     */
    async invalidatePattern(pattern: string): Promise<void> {
        try {
            if (!client.isReady) return;
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(keys);
                logger.debug(`[Redis] Invalidé ${keys.length} clés (pattern: ${pattern})`);
            }
        } catch (error) {
            logger.warn(`[Redis] Erreur invalidatePattern ${pattern}:`, error);
        }
    }
}

export const redisCache = new RedisCacheService();