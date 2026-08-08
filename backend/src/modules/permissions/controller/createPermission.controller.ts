import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CreatePermissionService } from '../services/createPermission.service';
import { CreatePermissionSchema } from '../validations/permission.validations';
import type { CreatePermissionPayload } from '../types/permission.types';

export class CreatePermissionController {
  constructor(private readonly createPermissionService: CreatePermissionService) {}

  public createPermission = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const payload = CreatePermissionSchema.parse(req.body) as CreatePermissionPayload;

      const permission = await this.createPermissionService.createPermission(payload);

      res.status(201).json({
        success: true,
        message: 'Permission créée avec succès.',
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