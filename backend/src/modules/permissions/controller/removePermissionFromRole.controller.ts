import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RemovePermissionFromRoleService } from '../services/removePermissionFromRole.service';
import {
  RoleIdParamSchema,
  PermissionIdParamSchema,
} from '../validations/permission.validations';

export class RemovePermissionFromRoleController {
  constructor(
    private readonly removePermissionFromRoleService: RemovePermissionFromRoleService
  ) {}

  public removePermissionFromRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const params = {
        roleId: String(req.params.roleId),
        permissionId: String(req.params.permissionId),
      };
      const { roleId, permissionId } = RoleIdParamSchema
        .extend({ permissionId: PermissionIdParamSchema.shape.permissionId })
        .parse(params);

      await this.removePermissionFromRoleService.removePermissionFromRole(roleId, permissionId);

      res.status(200).json({
        success: true,
        message: 'Permission retirée du rôle avec succès.',
        data: null,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: 'Erreur de validation des paramètres.',
          errors: error.issues,
        });
        return;
      }
      next(error);
    }
  };
}