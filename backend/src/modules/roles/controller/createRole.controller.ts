import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CreateRoleService } from '../services/createRole.service';
import { CreateRoleSchema } from '../validations/role.validations';
import type { CreateRolePayload } from '../types/role.types';

export class CreateRoleController {
  constructor(private readonly createRoleService: CreateRoleService) {}

  public createRole = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const payload = CreateRoleSchema.parse(req.body) as CreateRolePayload;

      const role = await this.createRoleService.createRole(payload);

      res.status(201).json({
        success: true,
        message: 'Rôle créé avec succès.',
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