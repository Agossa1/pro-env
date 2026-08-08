"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const database_1 = __importDefault(require("./database"));
const logger_1 = require("../../config/loggers/logger");
/**
 * Implémentation PostgreSQL du service Database
 */
class PostgresDatabase {
    constructor() {
        this.pool = new pg_1.Pool({
            host: database_1.default.host,
            port: database_1.default.port,
            user: database_1.default.user,
            password: database_1.default.password,
            database: database_1.default.database,
            max: 20, // Maximum 20 connexions simultanées
            idleTimeoutMillis: 30000, // Fermer les connexions inactives après 30s
            connectionTimeoutMillis: 5000, // Timeout de connexion : 5 secondes
        });
        this.pool.on("error", (error) => {
            const shortMsg = error.message || "Unknown pool error";
            logger_1.logger.error(`PostgreSQL pool error ❌ [${error.code || 'NoCode'}]: ${shortMsg}`);
        });
    }
    async connect() {
        try {
            const client = await this.pool.connect();
            try {
                await client.query("SELECT 1");
                logger_1.logger.info("PostgreSQL connected ✅");
            }
            finally {
                client.release();
            }
        }
        catch (error) {
            const shortMsg = error.message || "Connection failed";
            logger_1.logger.error(`Unable to connect to PostgreSQL ❌ [${error.code || 'NoCode'}]: ${shortMsg}`);
            throw error;
        }
    }
    /**
     * Retourne un client du pool pour les transactions
     */
    async getClient() {
        return await this.pool.connect();
    }
    /**
     * Exécute une requête SQL simple (pas de transaction)
     * @returns Le tableau de résultats (rows)
     */
    async query(sql, params = []) {
        try {
            return await this.pool.query(sql, params);
        }
        catch (error) {
            // Extraction des informations clés de l'erreur PostgreSQL
            const sqlCode = error.code || 'Code inconnu';
            const message = error.message || 'Erreur SQL générique';
            // Log condensé sur une seule ligne au lieu du gros bloc JSON
            logger_1.logger.error(`Database Error [${sqlCode}]: ${message}`);
            // On propage l'erreur originale pour que l'application gère le statut HTTP (ex: 400)
            throw error;
        }
    }
    async close() {
        await this.pool.end();
    }
}
exports.default = PostgresDatabase;
//# sourceMappingURL=postgres.js.map