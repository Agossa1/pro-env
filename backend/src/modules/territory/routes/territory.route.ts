import { Router } from 'express';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';

// Controllers — Territory Types
import { GetTerritoryTypesController } from '../controller/getTerritoryTypes.controller';
import { GetTerritoryTypeByCodeController } from '../controller/getTerritoryTypeByCode.controller';
import { GetTerritoryTypeByIdController } from '../controller/getTerritoryTypeById.controller';
import { CreateTerritoryTypeController } from '../controller/createTerritoryType.controller';
import { UpdateTerritoryTypeController } from '../controller/updateTerritoryType.controller';
import { DeleteTerritoryTypeController } from '../controller/deleteTerritoryType.controller';

// Controllers — Territories
import { CreateTerritoryController } from '../controller/createTerritory.controller';
import { GetAllTerritoriesController } from '../controller/getAllTerritories.controller';
import { GetTerritoryByIdController } from '../controller/getTerritoryById.controller';
import { GetTerritoryByCodeController } from '../controller/getTerritoryByCode.controller';

export class TerritoryRoutes {
  public router: Router;

  constructor(
    private readonly createTerritoryController: CreateTerritoryController,
    private readonly getTerritoryTypesController: GetTerritoryTypesController,
    private readonly getTerritoryTypeByCodeController: GetTerritoryTypeByCodeController,
    private readonly getTerritoryTypeByIdController: GetTerritoryTypeByIdController,
    private readonly createTerritoryTypeController: CreateTerritoryTypeController,
    private readonly updateTerritoryTypeController: UpdateTerritoryTypeController,
    private readonly deleteTerritoryTypeController: DeleteTerritoryTypeController,
    private readonly getAllTerritoriesController: GetAllTerritoriesController,
    private readonly getTerritoryByIdController: GetTerritoryByIdController,
    private readonly getTerritoryByCodeController: GetTerritoryByCodeController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // ── Routes protégées par authentification ──────────────────────────────
    this.router.use(authMiddleware);

    // ── Territory Types ────────────────────────────────────────────────────
    // GET    /api/territories/types
    this.router.get('/types', this.getTerritoryTypesController.getTerritoryTypes);

    // GET    /api/territories/types/code/:code
    this.router.get('/types/code/:code', this.getTerritoryTypeByCodeController.getTerritoryTypeByCode);

    // GET    /api/territories/types/:id
    this.router.get('/types/:id', this.getTerritoryTypeByIdController.getTerritoryTypeById);

    // POST   /api/territories/types
    this.router.post('/types', this.createTerritoryTypeController.createTerritoryType);

    // PUT    /api/territories/types/:id
    this.router.put('/types/:id', this.updateTerritoryTypeController.updateTerritoryType);

    // DELETE /api/territories/types/:id
    this.router.delete('/types/:id', this.deleteTerritoryTypeController.deleteTerritoryType);

    // ── Territories ────────────────────────────────────────────────────────
    // GET    /api/territories
    this.router.get('/', this.getAllTerritoriesController.getAllTerritories);

    // GET    /api/territories/code/:code
    this.router.get('/code/:code', this.getTerritoryByCodeController.getTerritoryByCode);

    // POST   /api/territories — création d'un territoire (+ GeoJSON uploadé)
    this.router.post('/', this.createTerritoryController.createTerritory);

    // GET    /api/territories/:id
    this.router.get('/:id', this.getTerritoryByIdController.getTerritoryById);
  }
}