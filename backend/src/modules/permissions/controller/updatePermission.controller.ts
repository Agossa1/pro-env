import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UpdatePermissionService } from '../services/updatePermission.service';
import { IdParamSchema, UpdatePermissionSchema } from '../validations/permission.validations';
import type { UpdatePermissionPayload } from '../types/permission.types';

export class UpdatePermissionController {
  constructor(private readonly updatePermissionService: UpdatePermissionService) {}

  public updatePermission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);
      const payload = UpdatePermissionSchema.parse(req.body) as UpdatePermissionPayload;

      const permission = await this.updatePermissionService.updatePermission(id, payload);

      res.status(200).json({
        success: true,
        message: 'Permission mise à jour avec succès.',
        data: permission,
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