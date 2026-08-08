import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetTerritoryTypeByIdService } from '../services/getTerritoryTypeById.service';
import { IdParamSchema } from '../validations/territory.validations';

export class GetTerritoryTypeByIdController {
  constructor(
    private readonly getTerritoryTypeByIdService: GetTerritoryTypeByIdService
  ) {}

  public getTerritoryTypeById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      const territoryType = await this.getTerritoryTypeByIdService.getTerritoryTypeById(id);

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