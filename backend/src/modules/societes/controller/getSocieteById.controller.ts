import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetSocieteByIdService } from '../services/getSocieteById.service';
import { IdParamSchema } from '../validations/societe.validations';

export class GetSocieteByIdController {
  constructor(private readonly getSocieteByIdService: GetSocieteByIdService) {}

  public getSocieteById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      const societe = await this.getSocieteByIdService.getSocieteById(id);

      res.status(200).json({
        success: true,
        message: 'Société récupérée avec succès.',
        data: societe,
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