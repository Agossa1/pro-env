
// Polyfill 'self' for shpjs library which references browser globals in its CJS bundl(globalThis as any).self = globalThis;

import { createServer } from "./server"
import { appConfig } from "./config/app/appConfig"
import { logger } from "./config/loggers/logger"
import PostgresDatabase from './config/database/postgres';
import { runMigrations } from './config/database/migrate';
import client from "./infra/redis/redis.config";
import { wsService } from "./infra/sockets/webSocket";

let database: PostgresDatabase | null = null;

const start = async () => {
    try {
        database = new PostgresDatabase();
        await database.connect()

        // Exécuter les migrations au démarrage
        await runMigrations();

        // Check if client is already open before connecting
        if (!client.isOpen) {
            await client.connect();
            logger.info('✅ Redis connected');
        }

        const app = await createServer(database)

        // Health check avancé : DB + Redis
        app.get('/api/health', async (_req, res) => {
            const health: any = {
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
            } catch {
                health.database = 'disconnected';
                health.status = 'degraded';
            }

            // Vérification Redis
            try {
                if (client.isOpen) {
                    await client.ping();
                    health.redis = 'connected';
                } else {
                    health.redis = 'disconnected';
                }
            } catch {
                health.redis = 'disconnected';
                health.status = 'degraded';
            }

            res.json(health);
        });

        const server = app.listen(appConfig.app.port, () => {
            logger.info(`🚀 Server running on port ${appConfig.app.port}`)
        })

        // Initialiser WebSockets avec le server HTTP (reloaded)
        wsService.init(server);

        // ── Graceful shutdown ───────────────────────────────────────────────
        const shutdown = async (signal: string) => {
            logger.info(`\n🛑 ${signal} reçu. Arrêt gracieux...`);

            // 1. Arrêter le serveur HTTP (ne plus accepter de nouvelles connexions)
            await new Promise<void>((resolve) => server.close(() => resolve()));
            logger.info('✅ Serveur HTTP arrêté');

            // 2. Fermer le pool PostgreSQL
            if (database) {
                try {
                    await database.close();
                    logger.info('✅ PostgreSQL pool fermé');
                } catch (e) {
                    logger.error('❌ Erreur fermeture PostgreSQL:', e);
                }
            }

            // 3. Fermer Redis
            try {
                if (client.isOpen) {
                    await client.disconnect();
                    logger.info('✅ Redis déconnecté');
                }
            } catch (e) {
                logger.error('❌ Erreur fermeture Redis:', e);
            }

            logger.info('Arrêt terminé. Au revoir 👋');
            process.exit(0);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));

        return server
    } catch (error) {
        logger.error('❌ Error starting server', error)
        process.exit(1)
    }
}

start()