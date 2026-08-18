import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CreateInfrastructureService } from '../services/createInfrastructure.service';
import { CreateInfrastructureSchema } from '../validations/infrastructure.validations';
import type { CreateInfrastructurePayload } from '../types/infrastructure.types';

export class CreateInfrastructureController {
  constructor(private readonly createInfrastructureService: CreateInfrastructureService) {}

  public createInfrastructure = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const payload = CreateInfrastructureSchema.parse(req.body) as CreateInfrastructurePayload;

      const infrastructure = await this.createInfrastructureService.createInfrastructure(payload);

      res.status(201).json({
        success: true,
        message: 'Infrastructure créée avec succès.',
        data: infrastructure,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Erreur de validation des données.', errors: error.issues });
        return;
      }
      next(error);
    }
  };
}
