import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetInfrastructureByIdService } from '../services/getInfrastructureById.service';
import { IdParamSchema } from '../validations/infrastructure.validations';

export class GetInfrastructureByIdController {
  constructor(private readonly getInfrastructureByIdService: GetInfrastructureByIdService) {}

  public getInfrastructureById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      const infrastructure = await this.getInfrastructureByIdService.getInfrastructureById(id);

      res.status(200).json({
        success: true,
        message: 'Infrastructure récupérée avec succès.',
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
