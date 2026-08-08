import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UpdateRoleService } from '../services/updateRole.service';
import { IdParamSchema, UpdateRoleSchema } from '../validations/role.validations';
import type { UpdateRolePayload } from '../types/role.types';

export class UpdateRoleController {
  constructor(private readonly updateRoleService: UpdateRoleService) {}

  public updateRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);
      const payload = UpdateRoleSchema.parse(req.body) as UpdateRolePayload;

      const role = await this.updateRoleService.updateRole(id, payload);

      res.status(200).json({
        success: true,
        message: 'Rôle mis à jour avec succès.',
        data: role,
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