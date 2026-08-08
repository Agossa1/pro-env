import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetPermissionsByRoleService } from '../services/getPermissionsByRole.service';
import { RoleIdParamSchema } from '../validations/permission.validations';

export class GetPermissionsByRoleController {
  constructor(private readonly getPermissionsByRoleService: GetPermissionsByRoleService) {}

  public getPermissionsByRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { roleId } = RoleIdParamSchema.parse(req.params);

      const permissions = await this.getPermissionsByRoleService.getPermissionsByRole(roleId);

      res.status(200).json({
        success: true,
        message: 'Permissions du rôle récupérées avec succès.',
        data: permissions,
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