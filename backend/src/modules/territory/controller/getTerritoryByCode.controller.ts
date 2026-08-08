import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetTerritoryByCodeService } from '../services/getTerritoryByCode.service';
import { CodeParamSchema } from '../validations/territory.validations';

export class GetTerritoryByCodeController {
  constructor(private readonly getTerritoryByCodeService: GetTerritoryByCodeService) {}

  public getTerritoryByCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { code } = CodeParamSchema.parse(req.params);

      const territory = await this.getTerritoryByCodeService.getTerritoryByCode(code);

      res.status(200).json({
        success: true,
        message: 'Territoire récupéré avec succès.',
        data: territory,
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