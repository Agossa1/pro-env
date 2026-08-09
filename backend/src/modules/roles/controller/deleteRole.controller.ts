import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DeleteRoleService } from '../services/deleteRole.service';
import { IdParamSchema } from '../validations/role.validations';

export class DeleteRoleController {
  constructor(private readonly deleteRoleService: DeleteRoleService) {}

  public deleteRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      await this.deleteRoleService.deleteRole(id);

      res.status(200).json({
        success: true,
        message: 'Rôle supprimé avec succès.',
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