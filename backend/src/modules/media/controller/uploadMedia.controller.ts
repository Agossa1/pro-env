import type { Request, Response, NextFunction } from 'express';
import { UploadMediaService } from '../services/uploadMedia.service';

export class UploadMediaController {
  constructor(private readonly uploadMediaService: UploadMediaService) {}

  public uploadMedia = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Le fichier est fourni par le middleware multer (uploadMiddleware) via req.file
      const file = (req as any).file;
      if (!file) {
        res.status(400).json({
          success: false,
          message: 'Aucun fichier fourni.',
        });
        return;
      }

      const result = await this.uploadMediaService.uploadMedia({
        buffer: file.buffer,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        module: (req.body as any)?.module ?? null,
        entityId: (req.body as any)?.entityId ?? null,
        uploadedBy: (req as any).user?.userId ?? null,
      });

      res.status(201).json({
        success: true,
        message: 'Media uploadé avec succès.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}