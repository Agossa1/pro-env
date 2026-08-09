"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const pg_1 = require("pg");
const logger_1 = require("../config/loggers/logger");
const seed_roles_1 = require("../infra/seed/seed.roles");
const seed_superadmin_1 = require("../infra/seed/seed.superadmin");
async function main() {
    const pool = new pg_1.Pool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Seed rôles et permissions
        await (0, seed_roles_1.seedRolesAndPermissions)(client);
        // Seed super admin
        await (0, seed_superadmin_1.seedSuperAdmin)(client);
        await client.query('COMMIT');
        logger_1.logger.info('🎉 Base de données seedée avec succès.');
    }
    catch (error) {
        await client.query('ROLLBACK');
        logger_1.logger.error('❌ Erreur lors du seeding :', error);
        process.exit(1);
    }
    finally {
        client.release();
        await pool.end();
    }
}
main();
//# sourceMappingURL=create-first-user.js.map