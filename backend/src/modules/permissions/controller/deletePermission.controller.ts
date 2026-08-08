import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DeletePermissionService } from '../services/deletePermission.service';
import { IdParamSchema } from '../validations/permission.validations';

export class DeletePermissionController {
  constructor(private readonly deletePermissionService: DeletePermissionService) {}

  public deletePermission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      await this.deletePermissionService.deletePermission(id);

      res.status(200).json({
        success: true,
        message: 'Permission supprimée avec succès.',
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