"use strict";
// Polyfill 'self' for shpjs library which references browser globals in its CJS bundl(globalThis as any).self = globalThis;
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const appConfig_1 = require("./config/app/appConfig");
const logger_1 = require("./config/loggers/logger");
const postgres_1 = __importDefault(require("./config/database/postgres"));
const migrate_1 = require("./config/database/migrate");
const redis_config_1 = __importDefault(require("./infra/redis/redis.config"));
const webSocket_1 = require("./infra/sockets/webSocket");
let database = null;
const start = async () => {
    try {
        database = new postgres_1.default();
        await database.connect();
        // Exécuter les migrations au démarrage
        await (0, migrate_1.runMigrations)();
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
        // Initialiser WebSockets avec le server HTTP (reloaded)
        webSocket_1.wsService.init(server);
        // ── Graceful shutdown ───────────────────────────────────────────────
        const shutdown = async (signal) => {
            logger_1.logger.info(`\n🛑 ${signal} reçu. Arrêt gracieux...`);
            // 1. Arrêter le serveur HTTP (ne plus accepter de nouvelles connexions)
            await new Promise((resolve) => server.close(() => resolve()));
            logger_1.logger.info('✅ Serveur HTTP arrêté');
            // 2. Fermer le pool PostgreSQL
            if (database) {
                try {
                    await database.close();
                    logger_1.logger.info('✅ PostgreSQL pool fermé');
                }
                catch (e) {
                    logger_1.logger.error('❌ Erreur fermeture PostgreSQL:', e);
                }
            }
            // 3. Fermer Redis
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
        process.exit(1);
    }
};
start();
//# sourceMappingURL=index.js.map