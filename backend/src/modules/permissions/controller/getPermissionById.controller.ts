import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetPermissionByIdService } from '../services/getPermissionById.service';
import { IdParamSchema } from '../validations/permission.validations';

export class GetPermissionByIdController {
  constructor(private readonly getPermissionByIdService: GetPermissionByIdService) {}

  public getPermissionById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      const permission = await this.getPermissionByIdService.getPermissionById(id);

      res.status(200).json({
        success: true,
        message: 'Permission récupérée avec succès.',
        data: permission,
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