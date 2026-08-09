import { Router } from 'express';
import PostgresDatabase from '../../config/database/postgres';
import { logger } from '../../config/loggers/logger';

// Repositories
import { PermissionRepository } from './repositories/permission.repositories';

// Services
import { GetPermissionsService } from './services/getPermissions.service';
import { GetPermissionByIdService } from './services/getPermissionById.service';
import { CreatePermissionService } from './services/createPermission.service';
import { UpdatePermissionService } from './services/updatePermission.service';
import { DeletePermissionService } from './services/deletePermission.service';
import { GetPermissionsByRoleService } from './services/getPermissionsByRole.service';
import { AssignPermissionsToRoleService } from './services/assignPermissionsToRole.service';
import { RemovePermissionFromRoleService } from './services/removePermissionFromRole.service';
import { GetRolesWithPermissionsService } from './services/getRolesWithPermissions.service';

// Controllers
import { GetPermissionsController } from './controller/getPermissions.controller';
import { GetPermissionByIdController } from './controller/getPermissionById.controller';
import { CreatePermissionController } from './controller/createPermission.controller';
import { UpdatePermissionController } from './controller/updatePermission.controller';
import { DeletePermissionController } from './controller/deletePermission.controller';
import { GetPermissionsByRoleController } from './controller/getPermissionsByRole.controller';
import { AssignPermissionsToRoleController } from './controller/assignPermissionsToRole.controller';
import { RemovePermissionFromRoleController } from './controller/removePermissionFromRole.controller';
import { GetRolesWithPermissionsController } from './controller/getRolesWithPermissions.controller';

// Routes
import { PermissionRoutes } from './routes/permission.route';

export const initPermissionModule = (db: PostgresDatabase): Router => {
  // 1. Initialiser le Repository
  const permissionRepository = new PermissionRepository(db, logger);

  // 2. Initialiser les Services Métiers
  const getPermissionsService = new GetPermissionsService(permissionRepository, logger);
  const getPermissionByIdService = new GetPermissionByIdService(permissionRepository, logger);
  const createPermissionService = new CreatePermissionService(permissionRepository, logger);
  const updatePermissionService = new UpdatePermissionService(permissionRepository, logger);
  const deletePermissionService = new DeletePermissionService(permissionRepository, logger);
  const getPermissionsByRoleService = new GetPermissionsByRoleService(permissionRepository, logger);
  const assignPermissionsToRoleService = new AssignPermissionsToRoleService(permissionRepository, logger);
  const removePermissionFromRoleService = new RemovePermissionFromRoleService(permissionRepository, logger);
  const getRolesWithPermissionsService = new GetRolesWithPermissionsService(permissionRepository, logger);

  // 3. Initialiser les Contrôleurs
  const getPermissionsController = new GetPermissionsController(getPermissionsService);
  const getPermissionByIdController = new GetPermissionByIdController(getPermissionByIdService);
  const createPermissionController = new CreatePermissionController(createPermissionService);
  const updatePermissionController = new UpdatePermissionController(updatePermissionService);
  const deletePermissionController = new DeletePermissionController(deletePermissionService);
  const getPermissionsByRoleController = new GetPermissionsByRoleController(getPermissionsByRoleService);
  const assignPermissionsToRoleController = new AssignPermissionsToRoleController(assignPermissionsToRoleService);
  const removePermissionFromRoleController = new RemovePermissionFromRoleController(removePermissionFromRoleService);
  const getRolesWithPermissionsController = new GetRolesWithPermissionsController(getRolesWithPermissionsService);

  // 4. Lier les Contrôleurs aux Routes
  const permissionRoutes = new PermissionRoutes(
    getPermissionsController,
    getPermissionByIdController,
    createPermissionController,
    updatePermissionController,
    deletePermissionController,
    getPermissionsByRoleController,
    assignPermissionsToRoleController,
    removePermissionFromRoleController,
    getRolesWithPermissionsController,
  );

  return permissionRoutes.router;
};