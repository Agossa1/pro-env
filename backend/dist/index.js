"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const appConfig_1 = require("./config/app/appConfig");
const logger_1 = require("./config/loggers/logger");
const postgres_1 = __importDefault(require("./config/database/postgres"));
const migrate_1 = require("./config/database/migrate");
const seed_territory_1 = require("./infra/seed/seed.territory");
const redis_config_1 = __importDefault(require("./infra/redis/redis.config"));
const webSocket_1 = require("./infra/sockets/webSocket");
let database = null;
const start = async () => {
    try {
        database = new postgres_1.default();
        await database.connect();
        // Exécuter les migrations au démarrage
        await (0, migrate_1.runMigrations)();
        // Seed automatique des territoires (idempotent — ignoré si déjà en base)
        try {
            await (0, seed_territory_1.seedTerritories)();
        }
        catch (seedError) {
            // Non bloquant : le serveur démarre même si le seed échoue
            logger_1.logger.error('⚠️  Seed territoires échoué (non bloquant) :', seedError);
        }
        // Check if client is already open before connecting
        if (!redis_config_1.default.isOpen) {
            await redis_config_1.default.connect();
            logger_1.logger.info('✅ Redis connected');
        }
        const app = await (0, server_1.createServer)(database);
        // Health check avancé : DB + Redis
        app.get('/api/health', async (_req, res) => {
            const health = {
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
            };
            // Vérification PostgreSQL
            try {
                if (database) {
                    await database.query('SELECT 1');
                    health.database = 'connected';
                }
            }
            catch {
                health.database = 'disconnected';
                health.status = 'degraded';
            }
            // Vérification Redis
            try {
                if (redis_config_1.default.isOpen) {
                    await redis_config_1.default.ping();
                    health.redis = 'connected';
                }
                else {
                    health.redis = 'disconnected';
                }
            }
            catch {
                health.redis = 'disconnected';
                health.status = 'degraded';
            }
            res.json(health);
        });
        const server = app.listen(appConfig_1.appConfig.app.port, () => {
            logger_1.logger.info(`🚀 Server running on port ${appConfig_1.appConfig.app.port}`);
        });
        // Gestion d'erreur sur listen (ex: port déjà occupé)
        server.on('error', async (error) => {
            logger_1.logger.error(`❌ Erreur lors de l'écoute sur le port ${appConfig_1.appConfig.app.port}:`, error.message);
            // Nettoyage des ressources déjà ouvertes
            if (database) {
                try {
                    await database.close();
                }
                catch (e) {
                    logger_1.logger.error('❌ Erreur fermeture PostgreSQL:', e);
                }
            }
            try {
                if (redis_config_1.default.isOpen) {
                    await redis_config_1.default.disconnect();
                }
            }
            catch (e) {
                logger_1.logger.error('❌ Erreur fermeture Redis:', e);
            }
            process.exit(1);
        });
        // Initialiser WebSockets avec le server HTTP (reloaded)
        webSocket_1.wsService.init(server);
        // ── Graceful shutdown ───────────────────────────────────────────────
        const shutdown = async (signal) => {
            logger_1.logger.info(`\n🛑 ${signal} reçu. Arrêt gracieux...`);
            // Timeout de sécurité : force la sortie après 10s
            const forceExit = setTimeout(() => {
                logger_1.logger.error('⏰ Arrêt forcé après 10 secondes (timeout)');
                process.exit(1);
            }, 10000);
            forceExit.unref();
            // 1. Fermer les connexions WebSocket avant le serveur HTTP
            try {
                webSocket_1.wsService.close();
                logger_1.logger.info('✅ WebSockets fermés');
            }
            catch (e) {
                logger_1.logger.error('❌ Erreur fermeture WebSockets:', e);
            }
            // 2. Arrêter le serveur HTTP (ne plus accepter de nouvelles connexions)
            await new Promise((resolve) => server.close(() => resolve()));
            logger_1.logger.info('✅ Serveur HTTP arrêté');
            // 3. Fermer le pool PostgreSQL
            if (database) {
                try {
                    await database.close();
                    logger_1.logger.info('✅ PostgreSQL pool fermé');
                }
                catch (e) {
                    logger_1.logger.error('❌ Erreur fermeture PostgreSQL:', e);
                }
            }
            // 4. Fermer Redis
            try {
                if (redis_config_1.default.isOpen) {
                    await redis_config_1.default.disconnect();
                    logger_1.logger.info('✅ Redis déconnecté');
                }
            }
            catch (e) {
                logger_1.logger.error('❌ Erreur fermeture Redis:', e);
            }
            logger_1.logger.info('Arrêt terminé. Au revoir 👋');
            process.exit(0);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        return server;
    }
    catch (error) {
        logger_1.logger.error('❌ Error starting server', error);
        // Nettoyage des ressources déjà ouvertes en cas d'échec
        if (database) {
            try {
                await database.close();
            }
            catch (e) {
                logger_1.logger.error('❌ Erreur fermeture PostgreSQL:', e);
            }
        }
        try {
            if (redis_config_1.default.isOpen) {
                await redis_config_1.default.disconnect();
            }
        }
        catch (e) {
            logger_1.logger.error('❌ Erreur fermeture Redis:', e);
        }
        process.exit(1);
    }
};
start().catch((error) => {
    logger_1.logger.error('💥 Erreur fatale non gérée au démarrage:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map