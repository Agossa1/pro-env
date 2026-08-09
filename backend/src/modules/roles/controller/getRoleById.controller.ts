import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetRoleByIdService } from '../services/getRoleById.service';
import { IdParamSchema } from '../validations/role.validations';

export class GetRoleByIdController {
  constructor(private readonly getRoleByIdService: GetRoleByIdService) {}

  public getRoleById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      const role = await this.getRoleByIdService.getRoleById(id);

      res.status(200).json({
        success: true,
        message: 'Rôle récupéré avec succès.',
        data: role,
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