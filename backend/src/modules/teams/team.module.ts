import { Router } from 'express';
import PostgresDatabase from '../../config/database/postgres';
import { logger } from '../../config/loggers/logger';

// Repositories
import { TeamRepository } from './repositories/team.repositories';
import { AuthRepository } from '../auth/repositories/auth.repositories';
import { PasswordService } from '../../config/passwords/passwordServices';

// Services
import { GetTeamsService } from './services/getTeams.service';
import { GetTeamByIdService } from './services/getTeamById.service';
import { CreateTeamService } from './services/createTeam.service';
import { UpdateTeamService } from './services/updateTeam.service';
import { DeleteTeamService } from './services/deleteTeam.service';
import { GetTeamMembersService } from './services/getTeamMembers.service';
import { AddMemberToTeamService } from './services/addMemberToTeam.service';
import { RemoveMemberFromTeamService } from './services/removeMemberFromTeam.service';

// Controllers
import { GetTeamsController } from './controller/getTeams.controller';
import { GetTeamByIdController } from './controller/getTeamById.controller';
import { CreateTeamController } from './controller/createTeam.controller';
import { UpdateTeamController } from './controller/updateTeam.controller';
import { DeleteTeamController } from './controller/deleteTeam.controller';
import { GetTeamMembersController } from './controller/getTeamMembers.controller';
import { AddMemberToTeamController } from './controller/addMemberToTeam.controller';
import { RemoveMemberFromTeamController } from './controller/removeMemberFromTeam.controller';

// Routes
import { TeamRoutes } from './routes/team.route';

export const initTeamModule = (db: PostgresDatabase): Router => {
  // 1. Repositories
  const teamRepository = new TeamRepository(db, logger);
  const authRepository = new AuthRepository(db, logger);
  const passwordService = new PasswordService();

  // 2. Services
  const getTeamsService = new GetTeamsService(teamRepository, logger);
  const getTeamByIdService = new GetTeamByIdService(teamRepository, logger);
  const createTeamService = new CreateTeamService(teamRepository, logger);
  const updateTeamService = new UpdateTeamService(teamRepository, logger);
  const deleteTeamService = new DeleteTeamService(teamRepository, logger);
  const getTeamMembersService = new GetTeamMembersService(teamRepository, logger);
  const addMemberToTeamService = new AddMemberToTeamService(teamRepository, authRepository, passwordService, logger);
  const removeMemberFromTeamService = new RemoveMemberFromTeamService(teamRepository, logger);

  // 3. Controllers
  const getTeamsController = new GetTeamsController(getTeamsService);
  const getTeamByIdController = new GetTeamByIdController(getTeamByIdService);
  const createTeamController = new CreateTeamController(createTeamService);
  const updateTeamController = new UpdateTeamController(updateTeamService);
  const deleteTeamController = new DeleteTeamController(deleteTeamService);
  const getTeamMembersController = new GetTeamMembersController(getTeamMembersService);
  const addMemberToTeamController = new AddMemberToTeamController(addMemberToTeamService);
  const removeMemberFromTeamController = new RemoveMemberFromTeamController(removeMemberFromTeamService);

  // 4. Routes
  const teamRoutes = new TeamRoutes(
    getTeamsController,
    getTeamByIdController,
    createTeamController,
    updateTeamController,
    deleteTeamController,
    getTeamMembersController,
    addMemberToTeamController,
    removeMemberFromTeamController,
  );

  return teamRoutes.router;
};