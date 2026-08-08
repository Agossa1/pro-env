"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = runMigrations;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("../loggers/logger");
dotenv_1.default.config();
/**
 * Script de migration automatique pour PostgreSQL
 * Lit les fichiers .sql dans le dossier migrations et les exécute dans l'ordre.
 */
async function runMigrations() {
    const pool = new pg_1.Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT),
    });
    const client = await pool.connect();
    try {
        logger_1.logger.info('🚀 Démarrage des migrations...');
        // 1. Créer la table de suivi des migrations si elle n'existe pas
        await client.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
        // 2. Lire les fichiers SQL dans le dossier migrations
        // __dirname = backend/src/config/database → remonter de 2 niveaux → backend/src
        const migrationsDir = path_1.default.join(__dirname, '..', '..', 'infra', 'migrations');
        const files = fs_1.default.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql') && fs_1.default.statSync(path_1.default.join(migrationsDir, f)).isFile())
            .sort();
        for (const file of files) {
            const { rowCount } = await client.query('SELECT 1 FROM _migrations WHERE name = $1', [file]);
            if (rowCount === 0) {
                logger_1.logger.info(`📝 Exécution de la migration : ${file}`);
                const sql = fs_1.default.readFileSync(path_1.default.join(migrationsDir, file), 'utf8');
                // ALTER TYPE ... ADD VALUE ne peut pas être exécuté dans une transaction
                const useTransaction = !sql.includes('ADD VALUE');
                if (useTransaction)
                    await client.query('BEGIN');
                try {
                    await client.query(sql);
                    await client.query('INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [file]);
                    if (useTransaction)
                        await client.query('COMMIT');
                    logger_1.logger.info(`✅ Migration réussie : ${file}`);
                }
                catch (error) {
                    if (useTransaction)
                        await client.query('ROLLBACK');
                    // Si l'erreur est que la colonne existe déjà, on considère que c'est un succès (déjà appliqué)
                    if (error.message.includes('already exists')) {
                        logger_1.logger.info(`⏩ Migration déjà appliquée (détecté par erreur SQL) : ${file}`);
                        // On l'enregistre quand même pour ne plus repasser dedans
                        await client.query('INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [file]);
                    }
                    else {
                        logger_1.logger.error(`❌ Échec de la migration ${file} :`, error);
                        throw error;
                    }
                }
            }
        }
        logger_1.logger.info('🎉 Toutes les migrations sont à jour.');
    }
    catch (error) {
        logger_1.logger.error('💥 Erreur fatale pendant les migrations :', error);
        throw error;
    }
    finally {
        client.release();
        await pool.end();
    }
}
// Seulement si appelé directement
if (require.main === module) {
    runMigrations().catch(() => process.exit(1));
}
//# sourceMappingURL=migrate.js.map