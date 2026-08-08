import { Router } from 'express';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';

// Controllers
import { GetRolesController } from '../controller/getRoles.controller';
import { GetRoleByIdController } from '../controller/getRoleById.controller';
import { GetRoleByCodeController } from '../controller/getRoleByCode.controller';
import { CreateRoleController } from '../controller/createRole.controller';
import { UpdateRoleController } from '../controller/updateRole.controller';
import { DeleteRoleController } from '../controller/deleteRole.controller';

export class RoleRoutes {
  public router: Router;

  constructor(
    private readonly getRolesController: GetRolesController,
    private readonly getRoleByIdController: GetRoleByIdController,
    private readonly getRoleByCodeController: GetRoleByCodeController,
    private readonly createRoleController: CreateRoleController,
    private readonly updateRoleController: UpdateRoleController,
    private readonly deleteRoleController: DeleteRoleController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // ── Routes protégées par authentification ──────────────────────────────
    this.router.use(authMiddleware);

    // GET /api/roles — liste paginée
    this.router.get('/', this.getRolesController.getRoles);

    // GET /api/roles/code/:code — rôle par code
    // (déclaré avant /:id pour éviter le conflit de route)
    this.router.get('/code/:code', this.getRoleByCodeController.getRoleByCode);

    // GET /api/roles/:id — rôle par ID
    this.router.get('/:id', this.getRoleByIdController.getRoleById);

    // POST /api/roles — création
    this.router.post('/', this.createRoleController.createRole);

    // PUT /api/roles/:id — mise à jour
    this.router.put('/:id', this.updateRoleController.updateRole);

    // DELETE /api/roles/:id — suppression
    this.router.delete('/:id', this.deleteRoleController.deleteRole);
  }
}