import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetTerritoryByIdService } from '../services/getTerritoryById.service';
import { IdParamSchema } from '../validations/territory.validations';

export class GetTerritoryByIdController {
  constructor(private readonly getTerritoryByIdService: GetTerritoryByIdService) {}

  public getTerritoryById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      const territory = await this.getTerritoryByIdService.getTerritoryById(id);

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