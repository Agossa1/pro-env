import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetInterventionByIdService } from '../services/getInterventionById.service';
import { IdParamSchema } from '../validations/intervention.validations';

export class GetInterventionByIdController {
  constructor(private readonly getInterventionByIdService: GetInterventionByIdService) {}

  public getInterventionById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      const intervention = await this.getInterventionByIdService.getInterventionById(id);

      res.status(200).json({
        success: true,
        message: 'Intervention récupérée avec succès.',
        data: intervention,
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