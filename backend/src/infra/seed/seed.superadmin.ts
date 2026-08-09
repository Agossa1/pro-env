import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PoolClient } from 'pg';
import { logger } from '../../config/loggers/logger';

const PASSWORD = 'Admin@2026!';
const EMAIL    = 'ayemanagossa@gmail.com';
const FULL_NAME = 'Ayema Nagossa';
const ROLE     = 'super_admin';

export const seedSuperAdmin = async (client: PoolClient): Promise<void> => {
  logger.info('Seeding super_admin...');

  try {
    // 1. Vérifier si l'email existe déjà
    const existing = await client.query(
      `SELECT id FROM auth WHERE LOWER(email) = LOWER($1)`,
      [EMAIL]
    );

    if (existing.rows.length > 0) {
      logger.warn(`L'utilisateur ${EMAIL} existe déjà (id: ${existing.rows[0].id})`);
      return;
    }

    // 2. Trouver le rôle SUPER_ADMIN
    const roleRes = await client.query(
      `SELECT id FROM roles WHERE code = $1 LIMIT 1`,
      [ROLE]
    );

    if (roleRes.rows.length === 0) {
      throw new Error(`Rôle "${ROLE}" introuvable dans la table roles.`);
    }
    const roleId: string = roleRes.rows[0].id;

    // 3. Hasher le mot de passe (avec le pepper pour correspondre au PasswordService)
    const pepper       = process.env.PASSWORD_PEPPER || '';
    const salt         = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(PASSWORD + pepper, salt);

    // 4. Créer l'utilisateur dans auth
    const authRes = await client.query(
      `INSERT INTO auth (full_name, email, role_id)
       VALUES ($1, LOWER($2), $3)
       RETURNING id`,
      [FULL_NAME, EMAIL, roleId]
    );
    const authId: string = authRes.rows[0].id;

    // 5. Créer les credentials
    await client.query(
      `INSERT INTO credentials (auth_id, password_hash)
       VALUES ($1, $2)`,
      [authId, passwordHash]
    );

    // 6. Mettre à jour le account_status (déjà créé par trigger)
    await client.query(
      `UPDATE account_status SET is_active = TRUE, is_verified = TRUE
       WHERE auth_id = $1`,
      [authId]
    );

    logger.info('✅ Super Admin créé avec succès !');
    logger.info('─────────────────────────────────');
    logger.info(`  ID        : ${authId}`);
    logger.info(`  Nom       : ${FULL_NAME}`);
    logger.info(`  Email     : ${EMAIL}`);
    logger.info(`  Rôle      : ${ROLE}`);
    logger.info(`  Mot de passe : ${PASSWORD}`);
    logger.info('─────────────────────────────────');

  } catch (error) {
    logger.error('❌ Erreur lors de la création du super admin :', error);
    throw error;
  }
};
