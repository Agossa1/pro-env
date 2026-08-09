import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DeleteInterventionService } from '../services/deleteIntervention.service';
import { IdParamSchema } from '../validations/intervention.validations';

export class DeleteInterventionController {
  constructor(private readonly deleteInterventionService: DeleteInterventionService) {}

  public deleteIntervention = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      await this.deleteInterventionService.deleteIntervention(id);

      res.status(200).json({
        success: true,
        message: 'Intervention supprimée avec succès.',
        data: null,
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