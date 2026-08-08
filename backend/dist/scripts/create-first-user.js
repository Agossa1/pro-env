"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Script de création du premier utilisateur SUPER_ADMIN
 * Usage : npx ts-node -r tsconfig-paths/register src/scripts/create-first-user.ts
 */
require("dotenv/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const pg_1 = require("pg");
const PASSWORD = 'Admin@2026!';
const EMAIL = 'ayemanagossa@gmail.com';
const FIRST = 'Ayema';
const LAST = 'Nagossa';
const ROLE = 'SUPER_ADMIN';
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
        // 1. Vérifier si l'email existe déjà
        const existing = await client.query(`SELECT u.id FROM users u
       INNER JOIN user_contacts uc ON uc.user_id = u.id AND uc.type = 'EMAIL' AND uc.is_primary = TRUE
       WHERE LOWER(uc.value) = LOWER($1) AND u.deleted_at IS NULL`, [EMAIL]);
        if (existing.rows.length > 0) {
            console.log(`⚠️  L'utilisateur ${EMAIL} existe déjà (id: ${existing.rows[0].id})`);
            await client.query('ROLLBACK');
            return;
        }
        // 2. Hasher le mot de passe
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(PASSWORD, salt);
        // 3. Créer l'utilisateur
        const userRes = await client.query(`INSERT INTO users (first_name, last_name, status)
       VALUES ($1, $2, 'ACTIVE')
       RETURNING id`, [FIRST, LAST]);
        const userId = userRes.rows[0].id;
        // 4. Ajouter l'email comme contact principal vérifié
        await client.query(`INSERT INTO user_contacts (user_id, type, value, is_primary, verified_at)
       VALUES ($1, 'EMAIL', LOWER($2), TRUE, NOW())`, [userId, EMAIL]);
        // 5. Créer les credentials
        await client.query(`INSERT INTO credentials (user_id, password_hash, must_change_password)
       VALUES ($1, $2, FALSE)`, [userId, passwordHash]);
        // 6. Profil & préférences
        await client.query(`INSERT INTO user_profiles   (user_id) VALUES ($1)`, [userId]);
        await client.query(`INSERT INTO user_preferences (user_id) VALUES ($1)`, [userId]);
        // 7. Historique statut
        await client.query(`INSERT INTO user_status_history (user_id, new_status, reason)
       VALUES ($1, 'ACTIVE', 'Création compte super admin initial')`, [userId]);
        // 8. Trouver le rôle SUPER_ADMIN
        const roleRes = await client.query(`SELECT id FROM roles WHERE code = $1 LIMIT 1`, [ROLE]);
        if (roleRes.rows.length === 0) {
            throw new Error(`Rôle "${ROLE}" introuvable dans la table roles. Vérifiez la migration 16_seed.sql.`);
        }
        const roleId = roleRes.rows[0].id;
        // 9. Créer un type d'organisation (si aucun n'existe)
        let orgTypeRes = await client.query(`SELECT id FROM organization_types WHERE code = 'SYSTEM' LIMIT 1`);
        let orgTypeId;
        if (orgTypeRes.rows.length === 0) {
            const newOrgType = await client.query(`INSERT INTO organization_types (code, name) VALUES ('SYSTEM', 'Système') RETURNING id`);
            orgTypeId = newOrgType.rows[0].id;
        }
        else {
            orgTypeId = orgTypeRes.rows[0].id;
        }
        // 10. Créer une organisation système (si elle n'existe pas)
        let orgRes = await client.query(`SELECT id FROM organizations WHERE code = 'PLATEFORME' LIMIT 1`);
        let orgId;
        if (orgRes.rows.length === 0) {
            const newOrg = await client.query(`INSERT INTO organizations (name, code, organization_type_id)
         VALUES ('Plateforme SIGIE', 'PLATEFORME', $1)
         RETURNING id`, [orgTypeId]);
            orgId = newOrg.rows[0].id;
        }
        else {
            orgId = orgRes.rows[0].id;
        }
        // 11. Créer le membre d'organisation
        const memberRes = await client.query(`INSERT INTO organization_members (organization_id, user_id, is_active)
       VALUES ($1, $2, TRUE)
       RETURNING id`, [orgId, userId]);
        const memberId = memberRes.rows[0].id;
        // 12. Attribuer le rôle SUPER_ADMIN
        await client.query(`INSERT INTO organization_member_roles (organization_member_id, role_id)
       VALUES ($1, $2)`, [memberId, roleId]);
        await client.query('COMMIT');
        console.log('\n✅ Super Admin créé avec succès !');
        console.log('─────────────────────────────────');
        console.log(`  ID        : ${userId}`);
        console.log(`  Prénom    : ${FIRST}`);
        console.log(`  Nom       : ${LAST}`);
        console.log(`  Email     : ${EMAIL}`);
        console.log(`  Rôle      : ${ROLE}`);
        console.log(`  Mot de passe : ${PASSWORD}`);
        console.log('─────────────────────────────────');
        console.log('⚠️  Changez le mot de passe après la première connexion.\n');
    }
    catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Erreur lors de la création du super admin :', error);
        process.exit(1);
    }
    finally {
        client.release();
        await pool.end();
    }
}
main();
//# sourceMappingURL=create-first-user.js.map