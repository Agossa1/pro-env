import type { Request, Response, NextFunction } from 'express';
import { GetMediaService } from '../services/getMedia.service';

export class GetMediaController {
  constructor(private readonly getMediaService: GetMediaService) {}

  public getMedia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        module: req.query.module as string | undefined,
        entityId: req.query.entityId as string | undefined,
        uploadedBy: req.query.uploadedBy as string | undefined,
      };

      const result = await this.getMediaService.getMedia(query);

      res.status(200).json({
        success: true,
        message: 'Liste des médias récupérée avec succès.',
        data: result.data,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  };
}