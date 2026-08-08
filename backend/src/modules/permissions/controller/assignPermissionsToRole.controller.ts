import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { AssignPermissionsToRoleService } from '../services/assignPermissionsToRole.service';
import {
  RoleIdParamSchema,
  AssignPermissionsSchema,
} from '../validations/permission.validations';

export class AssignPermissionsToRoleController {
  constructor(
    private readonly assignPermissionsToRoleService: AssignPermissionsToRoleService
  ) {}

  public assignPermissionsToRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { roleId } = RoleIdParamSchema.parse(req.params);
      const { permissionIds } = AssignPermissionsSchema.parse(req.body);

      const assigned = await this.assignPermissionsToRoleService.assignPermissionsToRole(
        roleId,
        permissionIds
      );

      res.status(200).json({
        success: true,
        message: 'Permissions assignées au rôle avec succès.',
        data: assigned,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Erreur de validation des données.',
          errors: error.issues,
        });
        return;
      }
      next(error);
    }
  };
}