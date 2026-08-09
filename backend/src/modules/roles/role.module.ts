import { Router } from 'express';
import PostgresDatabase from '../../config/database/postgres';
import { logger } from '../../config/loggers/logger';

// Repositories
import { RoleRepository } from './repositories/role.repositories';

// Services
import { GetRolesService } from './services/getRoles.service';
import { GetRoleByIdService } from './services/getRoleById.service';
import { GetRoleByCodeService } from './services/getRoleByCode.service';
import { CreateRoleService } from './services/createRole.service';
import { UpdateRoleService } from './services/updateRole.service';
import { DeleteRoleService } from './services/deleteRole.service';

// Controllers
import { GetRolesController } from './controller/getRoles.controller';
import { GetRoleByIdController } from './controller/getRoleById.controller';
import { GetRoleByCodeController } from './controller/getRoleByCode.controller';
import { CreateRoleController } from './controller/createRole.controller';
import { UpdateRoleController } from './controller/updateRole.controller';
import { DeleteRoleController } from './controller/deleteRole.controller';

// Routes
import { RoleRoutes } from './routes/role.route';

export const initRoleModule = (db: PostgresDatabase): Router => {
  // 1. Initialiser le Repository
  const roleRepository = new RoleRepository(db, logger);

  // 2. Initialiser les Services Métiers
  const getRolesService = new GetRolesService(roleRepository, logger);
  const getRoleByIdService = new GetRoleByIdService(roleRepository, logger);
  const getRoleByCodeService = new GetRoleByCodeService(roleRepository, logger);
  const createRoleService = new CreateRoleService(roleRepository, logger);
  const updateRoleService = new UpdateRoleService(roleRepository, logger);
  const deleteRoleService = new DeleteRoleService(roleRepository, logger);

  // 3. Initialiser les Contrôleurs
  const getRolesController = new GetRolesController(getRolesService);
  const getRoleByIdController = new GetRoleByIdController(getRoleByIdService);
  const getRoleByCodeController = new GetRoleByCodeController(getRoleByCodeService);
  const createRoleController = new CreateRoleController(createRoleService);
  const updateRoleController = new UpdateRoleController(updateRoleService);
  const deleteRoleController = new DeleteRoleController(deleteRoleService);

  // 4. Lier les Contrôleurs aux Routes
  const roleRoutes = new RoleRoutes(
    getRolesController,
    getRoleByIdController,
    getRoleByCodeController,
    createRoleController,
    updateRoleController,
    deleteRoleController,
  );

  return roleRoutes.router;
};