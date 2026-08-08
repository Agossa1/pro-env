import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetSocieteTerritoriesService } from '../services/getSocieteTerritories.service';
import { IdParamSchema } from '../validations/societe.validations';

export class GetSocieteTerritoriesController {
  constructor(
    private readonly getSocieteTerritoriesService: GetSocieteTerritoriesService
  ) {}

  public getSocieteTerritories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      const territories = await this.getSocieteTerritoriesService.getSocieteTerritories(id);

      res.status(200).json({
        success: true,
        message: 'Territoires de compétence récupérés avec succès.',
        data: territories,
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