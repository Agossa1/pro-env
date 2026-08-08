import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CreateInterventionService } from '../services/createIntervention.service';
import { CreateInterventionSchema } from '../validations/intervention.validations';
import type { CreateInterventionPayload } from '../types/intervention.types';

export class CreateInterventionController {
  constructor(private readonly createInterventionService: CreateInterventionService) {}

  public createIntervention = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const payload = CreateInterventionSchema.parse(req.body) as CreateInterventionPayload;

      const intervention = await this.createInterventionService.createIntervention(payload);

      res.status(201).json({
        success: true,
        message: 'Intervention créée avec succès.',
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