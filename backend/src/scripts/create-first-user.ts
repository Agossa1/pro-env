import 'dotenv/config';
import { Pool } from 'pg';
import { logger } from '../config/loggers/logger';
import { seedRolesAndPermissions } from '../infra/seed/seed.roles';
import { seedSuperAdmin } from '../infra/seed/seed.superadmin';

async function main() {
  const pool = new Pool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     Number(process.env.DB_PORT) || 5432,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    // Seed rôles et permissions
    await seedRolesAndPermissions(client);

    // Seed super admin
    await seedSuperAdmin(client);

    await client.query('COMMIT');
    logger.info('🎉 Base de données seedée avec succès.');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('❌ Erreur lors du seeding :', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
