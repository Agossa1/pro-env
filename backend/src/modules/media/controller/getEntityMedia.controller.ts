import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { GetEntityMediaService } from '../services/getEntityMedia.service';
import { EntityIdParamSchema } from '../validations/media.validations';

export class GetEntityMediaController {
  constructor(private readonly getEntityMediaService: GetEntityMediaService) {}

  public getEntityMedia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { entityId } = EntityIdParamSchema.parse(req.params);

      const media = await this.getEntityMediaService.getEntityMedia(entityId);

      res.status(200).json({
        success: true,
        message: 'Médias de l\'entité récupérés avec succès.',
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