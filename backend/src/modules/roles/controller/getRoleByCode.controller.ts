import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetRoleByCodeService } from '../services/getRoleByCode.service';
import { CodeParamSchema } from '../validations/role.validations';

export class GetRoleByCodeController {
  constructor(private readonly getRoleByCodeService: GetRoleByCodeService) {}

  public getRoleByCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { code } = CodeParamSchema.parse(req.params);

      const role = await this.getRoleByCodeService.getRoleByCode(code);

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