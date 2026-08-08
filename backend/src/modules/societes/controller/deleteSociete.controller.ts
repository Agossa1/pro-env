import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DeleteSocieteService } from '../services/deleteSociete.service';
import { IdParamSchema } from '../validations/societe.validations';

export class DeleteSocieteController {
  constructor(private readonly deleteSocieteService: DeleteSocieteService) {}

  public deleteSociete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      await this.deleteSocieteService.deleteSociete(id);

      res.status(200).json({
        success: true,
        message: 'Société supprimée avec succès.',
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