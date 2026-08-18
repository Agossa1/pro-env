import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DeleteInfrastructureService } from '../services/deleteInfrastructure.service';
import { IdParamSchema } from '../validations/infrastructure.validations';

export class DeleteInfrastructureController {
  constructor(private readonly deleteInfrastructureService: DeleteInfrastructureService) {}

  public deleteInfrastructure = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      await this.deleteInfrastructureService.deleteInfrastructure(id);

      res.status(200).json({
        success: true,
        message: 'Infrastructure supprimée avec succès.',
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
