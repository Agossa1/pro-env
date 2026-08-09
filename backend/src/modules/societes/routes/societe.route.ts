import { Router } from 'express';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';

// Controllers
import { GetSocietesController } from '../controller/getSocietes.controller';
import { GetSocieteByIdController } from '../controller/getSocieteById.controller';
import { GetSocieteByRegistrationNumberController } from '../controller/getSocieteByRegistrationNumber.controller';
import { CreateSocieteController } from '../controller/createSociete.controller';
import { UpdateSocieteController } from '../controller/updateSociete.controller';
import { DeleteSocieteController } from '../controller/deleteSociete.controller';
import { GetSocieteTerritoriesController } from '../controller/getSocieteTerritories.controller';

export class SocieteRoutes {
  public router: Router;

  constructor(
    private readonly getSocietesController: GetSocietesController,
    private readonly getSocieteByIdController: GetSocieteByIdController,
    private readonly getSocieteByRegistrationNumberController: GetSocieteByRegistrationNumberController,
    private readonly createSocieteController: CreateSocieteController,
    private readonly updateSocieteController: UpdateSocieteController,
    private readonly deleteSocieteController: DeleteSocieteController,
    private readonly getSocieteTerritoriesController: GetSocieteTerritoriesController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // ── Routes protégées par authentification ──────────────────────────────
    this.router.use(authMiddleware);

    // GET /api/societes — liste paginée (filtre ?type=)
    this.router.get('/', this.getSocietesController.getSocietes);

    // GET /api/societes/registration/:registrationNumber — par n° d'enregistrement
    // (déclaré avant /:id pour éviter le conflit de route)
    this.router.get(
      '/registration/:registrationNumber',
      this.getSocieteByRegistrationNumberController.getSocieteByRegistrationNumber
    );

    // GET /api/societes/:id/territories — territoires de compétence
    this.router.get('/:id/territories', this.getSocieteTerritoriesController.getSocieteTerritories);

    // GET /api/societes/:id — détail
    this.router.get('/:id', this.getSocieteByIdController.getSocieteById);

    // POST /api/societes — création
    this.router.post('/', this.createSocieteController.createSociete);

    // PUT /api/societes/:id — mise à jour
    this.router.put('/:id', this.updateSocieteController.updateSociete);

    // DELETE /api/societes/:id — suppression
    this.router.delete('/:id', this.deleteSocieteController.deleteSociete);
  }
}