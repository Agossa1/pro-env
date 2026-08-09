import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { DeleteMediaService } from '../services/deleteMedia.service';
import { IdParamSchema } from '../validations/media.validations';

export class DeleteMediaController {
  constructor(private readonly deleteMediaService: DeleteMediaService) {}

  public deleteMedia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = IdParamSchema.parse(req.params);

      await this.deleteMediaService.deleteMedia(id);

      res.status(200).json({
        success: true,
        message: 'Media supprimé avec succès.',
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