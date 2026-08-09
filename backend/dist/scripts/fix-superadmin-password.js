"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Script de correction : recalcule le hash du mot de passe du super admin
 * avec le pepper correct (depuis .env) et le met à jour en base.
 */
require("dotenv/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const pg_1 = require("pg");
const logger_1 = require("../config/loggers/logger");
const EMAIL = 'ayemanagossa@gmail.com';
const PASSWORD = 'Admin@2026!';
const PEPPER = process.env.PASSWORD_PEPPER || '';
async function fixSuperAdminPassword() {
    const pool = new pg_1.Pool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
    const client = await pool.connect();
    try {
        if (!PEPPER) {
            throw new Error('❌ PASSWORD_PEPPER est vide. Vérifiez votre fichier .env.');
        }
        logger_1.logger.info(`🔑 PEPPER chargé : ${PEPPER.substring(0, 8)}...`);
        // 1. Trouver l'utilisateur
        const authRes = await client.query(`SELECT a.id FROM auth a WHERE LOWER(a.email) = LOWER($1)`, [EMAIL]);
        if (authRes.rows.length === 0) {
            throw new Error(`❌ Utilisateur ${EMAIL} introuvable. Lancez d'abord le seed.`);
        }
        const authId = authRes.rows[0].id;
        // 2. Recalculer le hash avec le pepper correct
        const passwordWithPepper = PASSWORD + PEPPER;
        const newHash = await bcryptjs_1.default.hash(passwordWithPepper, 12);
        // 3. Mettre à jour le hash en base
        await client.query(`UPDATE credentials SET password_hash = $1 WHERE auth_id = $2`, [newHash, authId]);
        // 4. S'assurer que le compte est actif et vérifié
        await client.query(`UPDATE account_status SET is_active = TRUE, is_verified = TRUE WHERE auth_id = $1`, [authId]);
        logger_1.logger.info('✅ Mot de passe corrigé avec succès !');
        logger_1.logger.info('─────────────────────────────────────────');
        logger_1.logger.info(`  Email        : ${EMAIL}`);
        logger_1.logger.info(`  Mot de passe : ${PASSWORD}`);
        logger_1.logger.info('─────────────────────────────────────────');
        logger_1.logger.info('Vous pouvez maintenant vous connecter avec ces identifiants.');
    }
    catch (error) {
        logger_1.logger.error('❌ Erreur :', error);
        throw error;
    }
    finally {
        client.release();
        await pool.end();
    }
}
fixSuperAdminPassword().catch(() => process.exit(1));
//# sourceMappingURL=fix-superadmin-password.js.map