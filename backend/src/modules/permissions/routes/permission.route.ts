import { Router } from 'express';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';

// Controllers
import { GetPermissionsController } from '../controller/getPermissions.controller';
import { GetPermissionByIdController } from '../controller/getPermissionById.controller';
import { CreatePermissionController } from '../controller/createPermission.controller';
import { UpdatePermissionController } from '../controller/updatePermission.controller';
import { DeletePermissionController } from '../controller/deletePermission.controller';
import { GetPermissionsByRoleController } from '../controller/getPermissionsByRole.controller';
import { AssignPermissionsToRoleController } from '../controller/assignPermissionsToRole.controller';
import { RemovePermissionFromRoleController } from '../controller/removePermissionFromRole.controller';
import { GetRolesWithPermissionsController } from '../controller/getRolesWithPermissions.controller';

export class PermissionRoutes {
  public router: Router;

  constructor(
    private readonly getPermissionsController: GetPermissionsController,
    private readonly getPermissionByIdController: GetPermissionByIdController,
    private readonly createPermissionController: CreatePermissionController,
    private readonly updatePermissionController: UpdatePermissionController,
    private readonly deletePermissionController: DeletePermissionController,
    private readonly getPermissionsByRoleController: GetPermissionsByRoleController,
    private readonly assignPermissionsToRoleController: AssignPermissionsToRoleController,
    private readonly removePermissionFromRoleController: RemovePermissionFromRoleController,
    private readonly getRolesWithPermissionsController: GetRolesWithPermissionsController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // ── Routes protégées par authentification ──────────────────────────────
    this.router.use(authMiddleware);

    // ── Roles with permissions ─────────────────────────────────────────────
    // GET /api/permissions/roles — rôles avec permissions agrégées
    // (déclaré avant /:id pour éviter le conflit de route)
    this.router.get('/roles', this.getRolesWithPermissionsController.getRolesWithPermissions);

    // GET /api/permissions/roles/:roleId — permissions d'un rôle
    this.router.get('/roles/:roleId', this.getPermissionsByRoleController.getPermissionsByRole);

    // POST /api/permissions/roles/:roleId — assigner des permissions à un rôle
    this.router.post('/roles/:roleId', this.assignPermissionsToRoleController.assignPermissionsToRole);

    // DELETE /api/permissions/roles/:roleId/:permissionId — retirer une permission d'un rôle
    this.router.delete(
      '/roles/:roleId/:permissionId',
      this.removePermissionFromRoleController.removePermissionFromRole
    );

    // ── Permissions CRUD ───────────────────────────────────────────────────
    // GET /api/permissions
    this.router.get('/', this.getPermissionsController.getPermissions);

    // GET /api/permissions/:id
    this.router.get('/:id', this.getPermissionByIdController.getPermissionById);

    // POST /api/permissions
    this.router.post('/', this.createPermissionController.createPermission);

    // PUT /api/permissions/:id
    this.router.put('/:id', this.updatePermissionController.updatePermission);

    // DELETE /api/permissions/:id
    this.router.delete('/:id', this.deletePermissionController.deletePermission);
  }
}