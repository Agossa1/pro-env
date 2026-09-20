import { createServer } from "./server"
import { appConfig } from "./config/app/appConfig"
import { logger } from "./config/loggers/logger"
import PostgresDatabase from './config/database/postgres';
import { runMigrations } from './config/database/migrate';
import { seedTerritories } from './infra/seed/seed.territory';
import client from "./infra/redis/redis.config";
import { wsService } from "./infra/sockets/webSocket";

let database: PostgresDatabase | null = null;

interface HealthStatus {
    status: 'ok' | 'degraded';
    timestamp: string;
    uptime: number;
    database?: string;
    redis?: string;
}

const start = async () => {
    try {
        database = new PostgresDatabase();
        await database.connect()

        // Exécuter les migrations au démarrage
        await runMigrations();

        // Seed automatique des territoires (idempotent — ignoré si déjà en base)
        try {
            await seedTerritories();
        } catch (seedError) {
            // Non bloquant : le serveur démarre même si le seed échoue
            logger.error('⚠️  Seed territoires échoué (non bloquant) :', seedError);
        }

        // Redis est optionnel : on ne bloque JAMAIS le démarrage du serveur si le
        // cache est indisponible (la connexion est gérée par redis.config.ts).
        if (client.isReady) {
            logger.info('✅ Redis connected');
        } else {
            logger.warn('⚠️  Redis indisponible — le serveur démarre sans cache');
        }

        const app = await createServer(database)

        // Health check avancé : DB + Redis
        app.get('/api/health', async (_req, res) => {
            const health: HealthStatus = {
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
                if (client.isReady) {
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

        // Gestion d'erreur sur listen (ex: port déjà occupé)
        server.on('error', async (error: NodeJS.ErrnoException) => {
            logger.error(`❌ Erreur lors de l'écoute sur le port ${appConfig.app.port}:`, error.message);

            // Nettoyage des ressources déjà ouvertes
            if (database) {
                try {
                    await database.close();
                } catch (e) {
                    logger.error('❌ Erreur fermeture PostgreSQL:', e);
                }
            }
            try {
                if (client.isOpen) {
                    await client.disconnect();
                }
            } catch (e) {
                logger.error('❌ Erreur fermeture Redis:', e);
            }

            process.exit(1);
        });

        // Initialiser WebSockets avec le server HTTP (reloaded)
        wsService.init(server);

        // ── Graceful shutdown ───────────────────────────────────────────────
        const shutdown = async (signal: string) => {
            logger.info(`\n🛑 ${signal} reçu. Arrêt gracieux...`);

            // Timeout de sécurité : force la sortie après 10s
            const forceExit = setTimeout(() => {
                logger.error('⏰ Arrêt forcé après 10 secondes (timeout)');
                process.exit(1);
            }, 10000);
            forceExit.unref();

            // 1. Fermer les connexions WebSocket avant le serveur HTTP
            try {
                wsService.close();
                logger.info('✅ WebSockets fermés');
            } catch (e) {
                logger.error('❌ Erreur fermeture WebSockets:', e);
            }

            // 2. Arrêter le serveur HTTP (ne plus accepter de nouvelles connexions)
            await new Promise<void>((resolve) => server.close(() => resolve()));
            logger.info('✅ Serveur HTTP arrêté');

            // 3. Fermer le pool PostgreSQL
            if (database) {
                try {
                    await database.close();
                    logger.info('✅ PostgreSQL pool fermé');
                } catch (e) {
                    logger.error('❌ Erreur fermeture PostgreSQL:', e);
                }
            }

            // 4. Fermer Redis
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

        // Nettoyage des ressources déjà ouvertes en cas d'échec
        if (database) {
            try {
                await database.close();
            } catch (e) {
                logger.error('❌ Erreur fermeture PostgreSQL:', e);
            }
        }
        try {
            if (client.isOpen) {
                await client.disconnect();
            }
        } catch (e) {
            logger.error('❌ Erreur fermeture Redis:', e);
        }

        process.exit(1)
    }
}

start().catch((error) => {
    logger.error('💥 Erreur fatale non gérée au démarrage:', error);
    process.exit(1);
});