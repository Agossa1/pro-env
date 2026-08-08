import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetMediaByIdService } from '../services/getMediaById.service';
import { IdParamSchema } from '../validations/media.validations';

export class GetMediaByIdController {
  constructor(private readonly getMediaByIdService: GetMediaByIdService) {}

  public getMediaById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      const media = await this.getMediaByIdService.getMediaById(id);

      res.status(200).json({
        success: true,
        message: 'Media récupéré avec succès.',
        data: media,
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