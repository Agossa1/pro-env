import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetTerritoryTypeByCodeService } from '../services/getTerritoryTypeByCode.service';
import { CodeParamSchema } from '../validations/territory.validations';

export class GetTerritoryTypeByCodeController {
  constructor(
    private readonly getTerritoryTypeByCodeService: GetTerritoryTypeByCodeService
  ) {}

  public getTerritoryTypeByCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { code } = CodeParamSchema.parse(req.params);

      const territoryType = await this.getTerritoryTypeByCodeService.getTerritoryTypeByCode(code);

      res.status(200).json({
        success: true,
        message: 'Type de territoire récupéré avec succès.',
        data: territoryType,
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