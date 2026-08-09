"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSuperAdmin = void 0;
require("dotenv/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = require("../../config/loggers/logger");
const PASSWORD = 'Admin@2026!';
const EMAIL = 'ayemanagossa@gmail.com';
const FULL_NAME = 'Ayema Nagossa';
const ROLE = 'super_admin';
const seedSuperAdmin = async (client) => {
    logger_1.logger.info('Seeding super_admin...');
    try {
        // 1. Vérifier si l'email existe déjà
        const existing = await client.query(`SELECT id FROM auth WHERE LOWER(email) = LOWER($1)`, [EMAIL]);
        if (existing.rows.length > 0) {
            logger_1.logger.warn(`L'utilisateur ${EMAIL} existe déjà (id: ${existing.rows[0].id})`);
            return;
        }
        // 2. Trouver le rôle SUPER_ADMIN
        const roleRes = await client.query(`SELECT id FROM roles WHERE code = $1 LIMIT 1`, [ROLE]);
        if (roleRes.rows.length === 0) {
            throw new Error(`Rôle "${ROLE}" introuvable dans la table roles.`);
        }
        const roleId = roleRes.rows[0].id;
        // 3. Hasher le mot de passe (avec le pepper pour correspondre au PasswordService)
        const pepper = process.env.PASSWORD_PEPPER || '';
        const salt = await bcryptjs_1.default.genSalt(12);
        const passwordHash = await bcryptjs_1.default.hash(PASSWORD + pepper, salt);
        // 4. Créer l'utilisateur dans auth
        const authRes = await client.query(`INSERT INTO auth (full_name, email, role_id)
       VALUES ($1, LOWER($2), $3)
       RETURNING id`, [FULL_NAME, EMAIL, roleId]);
        const authId = authRes.rows[0].id;
        // 5. Créer les credentials
        await client.query(`INSERT INTO credentials (auth_id, password_hash)
       VALUES ($1, $2)`, [authId, passwordHash]);
        // 6. Mettre à jour le account_status (déjà créé par trigger)
        await client.query(`UPDATE account_status SET is_active = TRUE, is_verified = TRUE
       WHERE auth_id = $1`, [authId]);
        logger_1.logger.info('✅ Super Admin créé avec succès !');
        logger_1.logger.info('─────────────────────────────────');
        logger_1.logger.info(`  ID        : ${authId}`);
        logger_1.logger.info(`  Nom       : ${FULL_NAME}`);
        logger_1.logger.info(`  Email     : ${EMAIL}`);
        logger_1.logger.info(`  Rôle      : ${ROLE}`);
        logger_1.logger.info(`  Mot de passe : ${PASSWORD}`);
        logger_1.logger.info('─────────────────────────────────');
    }
    catch (error) {
        logger_1.logger.error('❌ Erreur lors de la création du super admin :', error);
        throw error;
    }
};
exports.seedSuperAdmin = seedSuperAdmin;
//# sourceMappingURL=seed.superadmin.js.map