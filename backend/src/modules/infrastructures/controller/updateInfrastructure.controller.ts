import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UpdateInfrastructureService } from '../services/updateInfrastructure.service';
import { IdParamSchema, UpdateInfrastructureSchema } from '../validations/infrastructure.validations';
import type { UpdateInfrastructurePayload } from '../types/infrastructure.types';

export class UpdateInfrastructureController {
  constructor(private readonly updateInfrastructureService: UpdateInfrastructureService) {}

  public updateInfrastructure = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);
      const payload = UpdateInfrastructureSchema.parse(req.body) as UpdateInfrastructurePayload;

      const infrastructure = await this.updateInfrastructureService.updateInfrastructure(id, payload);

      res.status(200).json({
        success: true,
        message: 'Infrastructure mise à jour avec succès.',
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
