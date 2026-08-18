import { Router } from 'express';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';

// Controllers
import { GetInfrastructuresController } from '../controller/getInfrastructures.controller';
import { GetInfrastructureByIdController } from '../controller/getInfrastructureById.controller';
import { CreateInfrastructureController } from '../controller/createInfrastructure.controller';
import { UpdateInfrastructureController } from '../controller/updateInfrastructure.controller';
import { DeleteInfrastructureController } from '../controller/deleteInfrastructure.controller';

export class InfrastructureRoutes {
  public router: Router;

  constructor(
    private readonly getInfrastructuresController: GetInfrastructuresController,
    private readonly getInfrastructureByIdController: GetInfrastructureByIdController,
    private readonly createInfrastructureController: CreateInfrastructureController,
    private readonly updateInfrastructureController: UpdateInfrastructureController,
    private readonly deleteInfrastructureController: DeleteInfrastructureController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // ── Routes protégées par authentification ──────────────────────────────
    this.router.use(authMiddleware);

    // GET /api/infrastructures — liste paginée (filtres ?territoryId=&type=&status=&condition=&search=)
    this.router.get('/', this.getInfrastructuresController.getInfrastructures);

    // GET /api/infrastructures/:id — détail d'une infrastructure
    this.router.get('/:id', this.getInfrastructureByIdController.getInfrastructureById);

    // POST /api/infrastructures — création
    this.router.post('/', this.createInfrastructureController.createInfrastructure);

    // PUT /api/infrastructures/:id — mise à jour
    this.router.put('/:id', this.updateInfrastructureController.updateInfrastructure);

    // DELETE /api/infrastructures/:id — suppression logique
    this.router.delete('/:id', this.deleteInfrastructureController.deleteInfrastructure);
  }
}