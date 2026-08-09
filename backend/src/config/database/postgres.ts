import { Pool, PoolClient } from 'pg';
import databaseConfig from './database';
import { Database } from './types';
import { logger } from '../../config/loggers/logger';

/**
 * Implémentation PostgreSQL du service Database
 */
export default class PostgresDatabase implements Database {
  private readonly pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: databaseConfig.host,
      port: databaseConfig.port,
      user: databaseConfig.user,
      password: databaseConfig.password,
      database: databaseConfig.database,
      max: 20,                        // Maximum 20 connexions simultanées
      idleTimeoutMillis: 30000,       // Fermer les connexions inactives après 30s
      connectionTimeoutMillis: 5000,  // Timeout de connexion : 5 secondes
    });

    this.pool.on("error", (error: any) => {
      const shortMsg = error.message || "Unknown pool error";
      logger.error(`PostgreSQL pool error ❌ [${error.code || 'NoCode'}]: ${shortMsg}`);
    });
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      try {
        await client.query("SELECT 1");
        logger.info("PostgreSQL connected ✅");
      } finally {
        client.release();
      }
    } catch (error: any) {
      const shortMsg = error.message || "Connection failed";
      logger.error(`Unable to connect to PostgreSQL ❌ [${error.code || 'NoCode'}]: ${shortMsg}`);
      throw error;
    }
  }

  /**
   * Retourne un client du pool pour les transactions
   */
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Exécute une requête SQL simple (pas de transaction)
   * @returns Le tableau de résultats (rows)
   */
  async query(sql: string, params: any[] = []): Promise<any> {
    try {
      return await this.pool.query(sql, params);
    } catch (error: any) {
      // Extraction des informations clés de l'erreur PostgreSQL
      const sqlCode = error.code || 'Code inconnu';
      const message = error.message || 'Erreur SQL générique';
      
      // Log condensé sur une seule ligne au lieu du gros bloc JSON
      logger.error(`Database Error [${sqlCode}]: ${message}`);
      
      // On propage l'erreur originale pour que l'application gère le statut HTTP (ex: 400)
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
