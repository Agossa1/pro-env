"use strict";
/*
 * |--------------------------------------------------------------------------
 * | SEED ROLES & PERMISSIONS
 * |--------------------------------------------------------------------------
 * | Peuple la table `roles` avec les 6 rôles applicatifs et la table
 * | `permissions` avec les permissions de base, puis lie les rôles aux
 * | permissions via `role_permissions` (N:N).
 * |--------------------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedRolesAndPermissions = void 0;
const logger_1 = require("../../config/loggers/logger");
const SEED_ROLES = [
    {
        code: 'super_admin',
        name: 'Super Administrateur',
        description: 'Accès complet à la plateforme (tiers platform).',
        tier: 'platform',
        canManageUsers: true,
        canManageRoles: true,
        permissions: [
            { module: 'auth', action: 'manage' },
            { module: 'permissions', action: 'manage' },
            { module: 'roles', action: 'manage' },
            { module: 'media', action: 'manage' },
            { module: 'teams', action: 'manage' },
            { module: 'territory', action: 'manage' },
            { module: 'organizations', action: 'manage' },
            { module: 'reports', action: 'manage' },
            { module: 'missions', action: 'manage' },
            { module: 'interventions', action: 'manage' },
            { module: 'teams', action: 'manage' },
            { module: 'infrastructures', action: 'manage' },
        ],
    },
    {
        code: 'admin_ministere',
        name: 'Administrateur Ministère',
        description: 'Administration centrale (tier platform).',
        tier: 'platform',
        canManageUsers: true,
        canManageRoles: false,
        permissions: [
            { module: 'auth', action: 'read' },
            { module: 'media', action: 'read' },
            { module: 'media', action: 'create' },
            { module: 'territory', action: 'read' },
            { module: 'territory', action: 'update' },
            { module: 'reports', action: 'read' },
            { module: 'reports', action: 'update' },
            { module: 'missions', action: 'manage' },
            { module: 'organizations', action: 'manage' },
            { module: 'infrastructures', action: 'manage' },
        ],
    },
    {
        code: 'prefecture',
        name: 'Préfecture',
        description: 'Administration départementale (tier territorial).',
        tier: 'territorial',
        canManageUsers: false,
        canManageRoles: false,
        permissions: [
            { module: 'territory', action: 'read' },
            { module: 'reports', action: 'read' },
            { module: 'missions', action: 'create' },
            { module: 'missions', action: 'read' },
            { module: 'missions', action: 'update' },
            { module: 'infrastructures', action: 'read' },
        ],
    },
    {
        code: 'admin_mairie',
        name: 'Administrateur Mairie',
        description: 'Administration communale (tier territorial).',
        tier: 'territorial',
        canManageUsers: true,
        canManageRoles: false,
        permissions: [
            { module: 'auth', action: 'read' },
            { module: 'territory', action: 'read' },
            { module: 'reports', action: 'read' },
            { module: 'reports', action: 'update' },
            { module: 'missions', action: 'create' },
            { module: 'missions', action: 'read' },
            { module: 'missions', action: 'update' },
            { module: 'missions', action: 'assign' },
            { module: 'interventions', action: 'read' },
            { module: 'infrastructures', action: 'read' },
        ],
    },
    {
        code: 'technicien',
        name: 'Technicien terrain',
        description: 'Agent de terrain d\'un prestataire (tier field).',
        tier: 'field',
        canManageUsers: false,
        canManageRoles: false,
        permissions: [
            { module: 'reports', action: 'create' },
            { module: 'reports', action: 'read' },
            { module: 'missions', action: 'read' },
            { module: 'interventions', action: 'create' },
            { module: 'interventions', action: 'read' },
            { module: 'interventions', action: 'update' },
            { module: 'infrastructures', action: 'read' },
        ],
    },
    {
        code: 'societe',
        name: 'Responsable Société / Prestataire',
        description: 'Compte de la société prestataire (tier field).',
        tier: 'field',
        canManageUsers: false,
        canManageRoles: false,
        permissions: [
            { module: 'missions', action: 'read' },
            { module: 'missions', action: 'update' },
            { module: 'interventions', action: 'read' },
            { module: 'interventions', action: 'create' },
            { module: 'interventions', action: 'update' },
            { module: 'reports', action: 'read' },
            { module: 'reports', action: 'create' },
            { module: 'infrastructures', action: 'read' },
            { module: 'teams', action: 'read' },
        ],
    },
    {
        code: 'citoyen',
        name: 'Citoyen',
        description: 'Usager de la plateforme (aucun tier).',
        tier: null,
        canManageUsers: false,
        canManageRoles: false,
        permissions: [
            { module: 'reports', action: 'create' },
            { module: 'reports', action: 'read' },
        ],
    },
];
// ─────────────────────────────────────────────────────────────────────────────
// Fonction de seed
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Insère les rôles et permissions de base, puis les liaisons role_permissions.
 * Idempotent : n'insère pas de doublon (ON CONFLICT DO NOTHING + vérifications).
 * @param client Client PostgreSQL (transaction gérée par l'appelant)
 */
const seedRolesAndPermissions = async (client) => {
    logger_1.logger.info('Seeding rôles & permissions...');
    for (const role of SEED_ROLES) {
        // 1. Insérer le rôle
        const roleRes = await client.query(`INSERT INTO roles (code, name, description, tier, can_manage_users, can_manage_roles)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (code) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         tier = EXCLUDED.tier,
         can_manage_users = EXCLUDED.can_manage_users,
         can_manage_roles = EXCLUDED.can_manage_roles
       RETURNING id`, [
            role.code,
            role.name,
            role.description,
            role.tier,
            role.canManageUsers,
            role.canManageRoles,
        ]);
        const roleId = roleRes.rows[0].id;
        // 2. Insérer la permission et lier au rôle
        for (const perm of role.permissions) {
            const permRes = await client.query(`INSERT INTO permissions (module, action, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (module, action) DO UPDATE SET description = EXCLUDED.description
         RETURNING id`, [perm.module, perm.action, `Permission ${perm.module}.${perm.action}`]);
            const permissionId = permRes.rows[0].id;
            // 3. Lier rôle ↔ permission (idempotent)
            await client.query(`INSERT INTO role_permissions (role_id, permission_id)
         VALUES ($1, $2)
         ON CONFLICT (role_id, permission_id) DO NOTHING`, [roleId, permissionId]);
        }
    }
    logger_1.logger.info(`Seeding rôles & permissions terminé (${SEED_ROLES.length} rôles).`);
};
exports.seedRolesAndPermissions = seedRolesAndPermissions;
//# sourceMappingURL=seed.roles.js.map