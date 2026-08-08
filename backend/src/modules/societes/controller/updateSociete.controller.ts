import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UpdateSocieteService } from '../services/updateSociete.service';
import { IdParamSchema, UpdateSocieteSchema } from '../validations/societe.validations';
import type { UpdateSocietePayload } from '../types/societe.types';

export class UpdateSocieteController {
  constructor(private readonly updateSocieteService: UpdateSocieteService) {}

  public updateSociete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);
      const payload = UpdateSocieteSchema.parse(req.body) as UpdateSocietePayload;

      const societe = await this.updateSocieteService.updateSociete(id, payload);

      res.status(200).json({
        success: true,
        message: 'Société mise à jour avec succès.',
        data: societe,
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