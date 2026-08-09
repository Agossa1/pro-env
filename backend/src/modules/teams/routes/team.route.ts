import { Router } from 'express';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware';

// Controllers
import { GetTeamsController } from '../controller/getTeams.controller';
import { GetTeamByIdController } from '../controller/getTeamById.controller';
import { CreateTeamController } from '../controller/createTeam.controller';
import { UpdateTeamController } from '../controller/updateTeam.controller';
import { DeleteTeamController } from '../controller/deleteTeam.controller';
import { GetTeamMembersController } from '../controller/getTeamMembers.controller';
import { AddMemberToTeamController } from '../controller/addMemberToTeam.controller';
import { RemoveMemberFromTeamController } from '../controller/removeMemberFromTeam.controller';

export class TeamRoutes {
  public router: Router;

  constructor(
    private readonly getTeamsController: GetTeamsController,
    private readonly getTeamByIdController: GetTeamByIdController,
    private readonly createTeamController: CreateTeamController,
    private readonly updateTeamController: UpdateTeamController,
    private readonly deleteTeamController: DeleteTeamController,
    private readonly getTeamMembersController: GetTeamMembersController,
    private readonly addMemberToTeamController: AddMemberToTeamController,
    private readonly removeMemberFromTeamController: RemoveMemberFromTeamController,
  ) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use(authMiddleware);

    // GET /api/teams — liste paginée (?teamType=&organizationId=)
    this.router.get('/', this.getTeamsController.getTeams);

    // GET /api/teams/:id/members — membres
    this.router.get('/:id/members', this.getTeamMembersController.getTeamMembers);

    // POST /api/teams/:id/members — ajouter un membre
    this.router.post('/:id/members', this.addMemberToTeamController.addMemberToTeam);

    // DELETE /api/teams/:id/members/:memberId — retirer un membre
    this.router.delete('/:id/members/:memberId', this.removeMemberFromTeamController.removeMemberFromTeam);

    // GET /api/teams/:id — détail
    this.router.get('/:id', this.getTeamByIdController.getTeamById);

    // POST /api/teams — création
    this.router.post('/', this.createTeamController.createTeam);

    // PUT /api/teams/:id — mise à jour
    this.router.put('/:id', this.updateTeamController.updateTeam);

    // DELETE /api/teams/:id — suppression logique
    this.router.delete('/:id', this.deleteTeamController.deleteTeam);
  }
}