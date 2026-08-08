import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UpdateInterventionService } from '../services/updateIntervention.service';
import { IdParamSchema, UpdateInterventionSchema } from '../validations/intervention.validations';
import type { UpdateInterventionPayload } from '../types/intervention.types';

export class UpdateInterventionController {
  constructor(private readonly updateInterventionService: UpdateInterventionService) {}

  public updateIntervention = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);
      const payload = UpdateInterventionSchema.parse(req.body) as UpdateInterventionPayload;

      const intervention = await this.updateInterventionService.updateIntervention(id, payload);

      res.status(200).json({
        success: true,
        message: 'Intervention mise à jour avec succès.',
        data: intervention,
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