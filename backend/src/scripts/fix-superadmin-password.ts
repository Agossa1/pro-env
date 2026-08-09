/**
 * Script de correction : recalcule le hash du mot de passe du super admin
 * avec le pepper correct (depuis .env) et le met à jour en base.
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';
import { logger } from '../config/loggers/logger';

const EMAIL    = 'ayemanagossa@gmail.com';
const PASSWORD = 'Admin@2026!';
const PEPPER   = process.env.PASSWORD_PEPPER || '';

async function fixSuperAdminPassword() {
  const pool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT) || 5432,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const client = await pool.connect();

  try {
    if (!PEPPER) {
      throw new Error('❌ PASSWORD_PEPPER est vide. Vérifiez votre fichier .env.');
    }

    logger.info(`🔑 PEPPER chargé : ${PEPPER.substring(0, 8)}...`);

    // 1. Trouver l'utilisateur
    const authRes = await client.query(
      `SELECT a.id FROM auth a WHERE LOWER(a.email) = LOWER($1)`,
      [EMAIL]
    );

    if (authRes.rows.length === 0) {
      throw new Error(`❌ Utilisateur ${EMAIL} introuvable. Lancez d'abord le seed.`);
    }
    const authId = authRes.rows[0].id;

    // 2. Recalculer le hash avec le pepper correct
    const passwordWithPepper = PASSWORD + PEPPER;
    const newHash = await bcrypt.hash(passwordWithPepper, 12);

    // 3. Mettre à jour le hash en base
    await client.query(
      `UPDATE credentials SET password_hash = $1 WHERE auth_id = $2`,
      [newHash, authId]
    );

    // 4. S'assurer que le compte est actif et vérifié
    await client.query(
      `UPDATE account_status SET is_active = TRUE, is_verified = TRUE WHERE auth_id = $1`,
      [authId]
    );

    logger.info('✅ Mot de passe corrigé avec succès !');
    logger.info('─────────────────────────────────────────');
    logger.info(`  Email        : ${EMAIL}`);
    logger.info(`  Mot de passe : ${PASSWORD}`);
    logger.info('─────────────────────────────────────────');
    logger.info('Vous pouvez maintenant vous connecter avec ces identifiants.');

  } catch (error) {
    logger.error('❌ Erreur :', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixSuperAdminPassword().catch(() => process.exit(1));
