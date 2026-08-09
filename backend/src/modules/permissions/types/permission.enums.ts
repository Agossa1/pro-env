/*
 * |--------------------------------------------------------------------------
 * | PERMISSION ENUMS
 * |--------------------------------------------------------------------------
 * | Modules et actions disponibles pour le contrôle d'accès RBAC.
 * | Reflète les valeurs utilisées dans la table `permissions` (module, action).
 * |--------------------------------------------------------------------------
 */

/** Modules applicatifs auxquels des permissions peuvent être attachées */
export enum PermissionModule {
  AUTH = 'auth',
  PERMISSIONS = 'permissions',
  ROLES = 'roles',
  TERRITORY = 'territory',
  ORGANIZATIONS = 'organizations',
  REPORTS = 'reports',
  MISSIONS = 'missions',
  INTERVENTIONS = 'interventions',
  INFRASTRUCTURES = 'infrastructures',
  MEDIA = 'media',
  TEAMS = 'teams',
}

/** Actions granulaires exécutables sur un module */
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  ASSIGN = 'assign',
}